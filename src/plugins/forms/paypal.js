const paypal = require("@paypal/checkout-server-sdk");
const { sendError, sendReg } = require("../../functions/messages");
const { totoUser } = require("../../models");
const { subcategory } = require("../premium/traducir");

// Configuración del cliente PayPal
const payPalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    "YOUR_PAYPAL_CLIENT_ID",
    "YOUR_PAYPAL_CLIENT_SECRET"
  )
);

module.exports = {
  name: "payPalLink",
  category: "payment",
  subcategory: "paypal",
  description: "Genera un enlace de PayPal para el registro premium",
  usage: "payPalLink <número de teléfono>",
  aliases: ["paypal", "pp"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant || remoteJid;

      if (remoteJid.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "Este comando no está permitido en grupos."
        );
        return;
      }

      // Verificar si el mensaje es de un grupo
      if (remoteJid.includes("-g.us")) {
        await sendError(
          totoro,
          msg,
          "Este comando no puede ser usado en grupos."
        );
        await msg.react("❌");
        return;
      }

      const phone = args[0];
      if (!phone) {
        await sendError(
          totoro,
          msg,
          "Debes proporcionar el número de teléfono del usuario."
        );
        await msg.react("❓");
        return;
      }

      // Buscar el usuario en la tabla totoUser
      const user = await totoUser.findOne({ where: { phone } });
      if (!user) {
        await sendError(
          totoro,
          msg,
          `No se encontró un usuario con el número de teléfono ${phone}.`
        );
        await msg.react("❌");
        return;
      }

      // Generar un link de pago de PayPal
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "10.00", // Monto a cobrar por el registro premium
            },
          },
        ],
      });

      let order;
      try {
        order = await payPalClient.execute(request);
      } catch (error) {
        await sendError(
          totoro,
          msg,
          "Error al generar el link de pago de PayPal."
        );
        return;
      }

      const approvalUrl = order.result.links.find(
        (link) => link.rel === "approve"
      ).href;

      // Enviar link de PayPal al usuario
      await sendReg(
        totoro,
        remoteJid,
        phone,
        user.name,
        user.age,
        null,
        user.country,
        0,
        approvalUrl
      );
      await msg.react("💵");
    } catch (error) {
      await sendError(totoro, msg, "Error al generar el link de PayPal.");
    }
  },
};