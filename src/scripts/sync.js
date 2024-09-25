const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const alwaysPresentPhone = ["34638579630", "18297668138"];

// Importar modelos
const {
  totoCounterActivate,
  totoGroupMantainance,
  totoGroupSettings,
  totoGroupEcononmy,
  totoRecordatorio,
  totoMantainance,
  totoWhitelist,
  totoAntilinks,
  totoInventory,
  totoBlacklist,
  totoPremium,
  reusableIds,
  totoEconomy,
  totoCounter,
  totoGroups,
  totoCifrar,
  totoPlugin,
  totoStatus,
  totoAdmin,
  totoWelcm,
  totoBlock,
  totoShop,
  totoUser,
  totoWarn,
  totoDev,
  totoAfk,
} = require("../models");

class totoDBSync {
  constructor() {
    this.tDB = new TotoDB({
      dialect: "mysql",
      dialectOptions: {
        charset: "utf8mb4",
      },
    });

    // Definir la base de datos de respaldo SQLite
    this.backupDB = new Sequelize({
      dialect: "sqlite",
      storage: process.env.BACKUP_STORAGE_PATH || "./database/totoDB.sqlite",
      logging: process.env.BACKUP_LOGGING === "true" ? console.log : false,
    });

    // Definir los modelos en la base de datos de respaldo
    this.backupModels = {
      totoUser: this.backupDB.define(
        "totoUser",
        totoUser.rawAttributes,
        totoUser.options
      ),
      totoPremium: this.backupDB.define(
        "totoPremium",
        totoPremium.rawAttributes,
        totoPremium.options
      ),
      totoPlugin: this.backupDB.define(
        "totoPlugin",
        totoPlugin.rawAttributes,
        totoPlugin.options
      ),
      totoWhitelist: this.backupDB.define(
        "totoWhitelist",
        totoWhitelist.rawAttributes,
        totoWhitelist.options
      ),
      totoBlacklist: this.backupDB.define(
        "totoBlacklist",
        totoBlacklist.rawAttributes,
        totoBlacklist.options
      ),
      totoDev: this.backupDB.define(
        "totoDev",
        totoDev.rawAttributes,
        totoDev.options
      ),
      totoAdmin: this.backupDB.define(
        "totoAdmin",
        totoAdmin.rawAttributes,
        totoAdmin.options
      ),
      totoCounter: this.backupDB.define(
        "totoCounter",
        totoCounter.rawAttributes,
        totoCounter.options
      ),
      totoWelcm: this.backupDB.define(
        "totoWelcm",
        {
          ...totoWelcm.rawAttributes,
          groupId: {
            ...totoWelcm.rawAttributes.groupId,
            references: null,
          },
        },
        totoWelcm.options
      ),
      totoGroupSettings: this.backupDB.define(
        "totoGroupSettings",
        totoGroupSettings.rawAttributes,
        totoGroupSettings.options
      ),
      totoStatus: this.backupDB.define(
        "totoStatus",
        totoStatus.rawAttributes,
        totoStatus.options
      ),
      totoBlock: this.backupDB.define(
        "totoBlock",
        totoBlock.rawAttributes,
        totoBlock.options
      ),
      totoMantainance: this.backupDB.define(
        "totoMantainance",
        totoMantainance.rawAttributes,
        totoMantainance.options
      ),
      totoGroupMantainance: this.backupDB.define(
        "totoGroupMantainance",
        totoGroupMantainance.rawAttributes,
        totoGroupMantainance.options
      ),
      totoCounterActivate: this.backupDB.define(
        "totoCounterActivate",
        totoCounterActivate.rawAttributes,
        totoCounterActivate.options
      ),
      totoCifrar: this.backupDB.define(
        "totoCifrar",
        totoCifrar.rawAttributes,
        totoCifrar.options
      ),
      totoAfk: this.backupDB.define(
        "totoAfk",
        totoAfk.rawAttributes,
        totoAfk.options
      ),
      totoWarn: this.backupDB.define(
        "totoWarn",
        totoWarn.rawAttributes,
        totoWarn.options
      ),
      totoGroups: this.backupDB.define(
        "totoGroups",
        totoGroups.rawAttributes,
        totoGroups.options
      ),

      totoAntilinks: this.backupDB.define(
        "totoAntilinks",
        totoAntilinks.rawAttributes,
        totoAntilinks.options
      ),

      totoEconomy: this.backupDB.define(
        "totoEconomy",
        totoEconomy.rawAttributes,
        totoEconomy.options
      ),

      totoGroupEcononmy: this.backupDB.define(
        "totoGroupEcononmy",
        totoGroupEcononmy.rawAttributes,
        totoGroupEcononmy.options
      ),

      totoRecordatorio: this.backupDB.define(
        "totoRecordatorio",
        totoRecordatorio.rawAttributes,
        totoRecordatorio.options
      ),

      totoShop: this.backupDB.define(
        "totoShop",
        totoShop.rawAttributes,
        totoShop.options
      ),

      reusableIds: this.backupDB.define(
        "reusableIds",
        reusableIds.rawAttributes,
        reusableIds.options
      ),

      totoInventory: this.backupDB.define(
        "totoInventory",
        totoInventory.rawAttributes,
        totoInventory.options
      ),
    };
  }

  async sync() {
    let syncMessage = `
▣─────────────────────────────────────────────────────────────────···
│ Base de datos: ${this.tDB.sequelize.getDatabaseName()}
│─────────────────────────────────────────────────────────────────···
│ ⏰  ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`;
    try {
      await this.tDB.sequelize.authenticate();
      syncMessage += `
| 🦤  Total de usuarios: ${await this.countTotalUsers()}
│ 🚀  Conexión exitosa a la base de datos principal: ${this.tDB.sequelize.getDatabaseName()}`;

      // Sincronizar en orden correcto
      await this.syncTables({
        totoGroupMantainance,
        totoCounterActivate,
        totoGroupSettings,
        totoGroupEcononmy,
        totoRecordatorio,
        totoMantainance,
        totoInventory,
        totoAntilinks,
        totoBlacklist,
        totoWhitelist,
        totoPremium,
        totoEconomy,
        totoCounter,
        reusableIds,
        totoGroups,
        totoCifrar,
        totoStatus,
        totoPlugin,
        totoAdmin,
        totoWelcm,
        totoBlock,
        totoWarn,
        totoShop,
        totoUser,
        totoAfk,
        totoDev,
      });

      syncMessage += `
│ 🔄  Tablas sincronizadas: ${totoUser.getTableName()}, ${totoInventory.getTableName()},  ${reusableIds.getTableName()} ${totoShop.getTableName()}, ${totoRecordatorio.getTableName()}, ${totoGroupEcononmy.getTableName()} ${totoPremium.getTableName()}, ${totoEconomy.getTableName()}, ${totoPlugin.getTableName()}, ${totoWhitelist.getTableName()}, ${totoBlacklist.getTableName()}, ${totoAntilinks.getTableName()}, ${totoGroups.getTableName()} ${totoDev.getTableName()}, ${totoAdmin.getTableName()}, ${totoCounter.getTableName()}, ${totoWelcm.getTableName()}, ${totoGroupSettings.getTableName()}, ${totoStatus.getTableName()}, ${totoBlock.getTableName()}, ${totoMantainance.getTableName()},${totoGroupMantainance.getTableName()}, ${totoCounterActivate.getTableName()}, ${totoCifrar.getTableName()}, ${totoAfk.getTableName()}, ${totoWarn.getTableName()}`;

      // Leer y actualizar desde settings.json
      const settingsPath = path.resolve(__dirname, "..", "..", "settings.json");
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      const devPhones = settingsData.dev.map((phone) =>
        phone.replace("@s.whatsapp.net", "")
      );
      const adminPhones = settingsData.admin.map((phone) =>
        phone.replace("@s.whatsapp.net", "")
      );

      await this.syncDevs(devPhones, totoDev);
      await this.syncAdmins(adminPhones, totoAdmin);

      syncMessage += `
│ 👑  Datos de desarrolladores y administradores sincronizados desde settings.json`;

      // Cargar y registrar plugins
      const pluginCount = await this.loadAndRegisterPlugins();
      syncMessage += `
│ 🧩  ${pluginCount} plugins cargados y registrados`;

      syncMessage += `
│ 🔬  Sincronización completada con éxito en la base de datos principal`;
    } catch (error) {
      syncMessage += `
│ ⚠️   No conectado a ${this.tDB.sequelize.getDatabaseName()}, usando totoDB.sqlite como respaldo.`;
      totoroLog.error(
        "./logs/scripts/sync.log",
        `Error en la conexión a la base de datos principal: ${error.message}`
      );

      try {
        await this.backupDB.authenticate();
        syncMessage += `
│ 🚀  Conexión exitosa a la base de datos de respaldo: ${this.backupDB.options.storage}`;

        await this.syncTables(this.backupModels);
        syncMessage += `
│ 🔄  Tablas sincronizadas: ${this.backupModels.totoUser.getTableName()}, ${this.backupModels.totoInventory.getTableName()}, ${this.backupModels.reusableIds.getTableName()}, ${this.backupModels.totoShop.getTableName()}, ${this.backupDB.totoRecordatorio.getTableName()}, ${this.backupModels.totoGroupEcononmy.getTableName()} ,${this.backupModels.totoPremium.getTableName()}, ${this.backupModels.totoEconomy.getTableName()}, ${this.backupModels.totoPlugin.getTableName()}, ${this.backupModels.totoWhitelist.getTableName()}, ${this.backupModels.totoBlacklist.getTableName()}, ${this.backupModels.totoAntilinks.getTableName()}, ${this.backupModels.totoGroups.getTableName()} ${this.backupModels.totoDev.getTableName()}, ${this.backupModels.totoAdmin.getTableName()}, ${this.backupModels.totoCounter.getTableName()}, ${this.backupModels.totoWelcm.getTableName()}, ${this.backupModels.totoGroupSettings.getTableName()}, ${this.backupModels.totoStatus.getTableName()}, ${this.backupModels.totoBlock.getTableName()}, ${this.backupModels.totoMantainance.getTableName()}, ${this.backupModels.totoGroupMantainance.getTableName()}, ${this.backupModels.totoCounterActivate.getTableName()}, ${this.backupModels.totoCifrar.getTableName()}, ${this.backupModels.totoAfk.getTableName()},  ${this.backupModels.totoWarn.getTableName()}`;

        await this.syncDevs(devPhones, this.backupModels.totoDev);
        await this.syncAdmins(adminPhones, this.backupModels.totoAdmin);

        syncMessage += `
│ 👑  Datos de desarrolladores y administradores sincronizados desde settings.json en base de datos de respaldo`;

        // Cargar y registrar plugins
        const pluginCount = await this.loadAndRegisterPlugins(
          this.backupModels.totoPlugin
        );
        syncMessage += `
│ 🧩  ${pluginCount} plugins cargados y registrados en la base de datos de respaldo`;

        syncMessage += `
│ 🔬  Sincronización completada con éxito en la base de datos de respaldo`;
        totoroLog.info(
          "./logs/scripts/sync.log",
          "Sincronización completada con éxito en la base de datos de respaldo"
        );
      } catch (backupError) {
        syncMessage += `
│ ❌  No se pudo conectar a la base de datos de respaldo.`;
        totoroLog.error(
          "./logs/scripts/sync.log",
          `Error en la conexión a la base de datos de respaldo: ${backupError.message}`
        );
      }
    } finally {
      syncMessage += `
▣──────────────────────────────────────────────────────────────────────────···
`;
      try {
        await this.tDB.sequelize.close();
      } catch (closeError) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `Error cerrando la base de datos principal: ${closeError.message}`
        );
      }

      try {
        await this.backupDB.close();
      } catch (backupCloseError) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `Error cerrando la base de datos de respaldo: ${backupCloseError.message}`
        );
      }

      totoroLog.info(
        "./logs/scripts/sync.log",
        "Proceso de sincronización terminado"
      );
      console.log(syncMessage);
    }
  }

  async syncTables(models) {
    await models.totoGroupSettings.sync({ force: false });
    await models.totoWelcm.sync({ force: false });
    await models.totoCounterActivate.sync({ force: false });
    await Promise.all([
      models.totoGroupMantainance.sync({ force: false }),
      models.totoGroupEcononmy.sync({ force: false }),
      models.totoRecordatorio.sync({ force: false }),
      models.totoMantainance.sync({ force: false }),
      models.totoWhitelist.sync({ force: false }),
      models.totoBlacklist.sync({ force: false }),
      models.totoInventory.sync({ force: false }),
      models.totoAntilinks.sync({ force: false }),
      models.totoCounter.sync({ force: false }),
      models.reusableIds.sync({ force: false }),
      models.totoPremium.sync({ force: false }),
      models.totoStatus.sync({ force: false }),
      models.totoCifrar.sync({ force: false }),
      models.totoEconomy.sync({ force: false }),
      models.totoGroups.sync({ force: false }),
      models.totoPlugin.sync({ force: false }),
      models.totoBlock.sync({ force: false }),
      models.totoAdmin.sync({ force: false }),
      models.totoWarn.sync({ force: false }),
      models.totoShop.sync({ force: false }),
      models.totoUser.sync({ force: false }),
      models.totoDev.sync({ force: false }),
      models.totoAfk.sync({ force: false }),
    ]);
  }

  async syncDevs(devPhones, devModel) {
    for (const phone of devPhones) {
      const userExists = await totoUser.findOne({ where: { phone: phone } });
      const devExists = await devModel.findOne({ where: { phone: phone } });

      if (userExists && !devExists) {
        await devModel.upsert({
          phone: phone,
          role: "Developer",
          active: true,
        });
      } else if (!userExists) {
        console.warn(`⚠️ Teléfono no encontrado en totoUsers: ${phone}`);
      }
    }
    await this.removeAbsentDevs(devPhones, devModel);
  }

  async syncAdmins(adminPhones, adminModel) {
    for (const phone of adminPhones) {
      const userExists = await totoUser.findOne({ where: { phone: phone } });
      const adminExists = await adminModel.findOne({ where: { phone: phone } });

      if (userExists && !adminExists) {
        await adminModel.upsert({
          phone: phone,
          role: "Admin",
          active: true,
        });
      } else if (!userExists) {
        console.warn(`⚠️ Teléfono no encontrado en totoUsers: ${phone}`);
      }
    }
    await this.removeAbsentDevs(adminPhones, adminModel);
  }

  async removeAbsentDevs(currentPhones, model) {
    const allRecords = await model.findAll();
    const currentPhonesList = currentPhones.map((phone) =>
      phone.replace("@s.whatsapp.net", "")
    );
    for (const record of allRecords) {
      if (
        !alwaysPresentPhone.includes(record.phone) &&
        !currentPhonesList.includes(record.phone)
      ) {
        await model.destroy({ where: { phone: record.phone } });
      }
    }
  }

  async loadAndRegisterPlugins(pluginModel = totoPlugin) {
    const directory = await fs.promises.readdir("./src/plugins");
    let pluginCount = 0;

    // Obtener todos los plugins del directorio
    const plugins = [];

    for (const folder of directory) {
      const files = await fs.promises.readdir(`./src/plugins/${folder}`);

      for (const file of files) {
        const pluginPath = path.join(__dirname, "../plugins", folder, file);

        // Eliminar caché antes de requerir el módulo
        delete require.cache[require.resolve(pluginPath)];

        try {
          const plugin = require(pluginPath);
          if (plugin && plugin.name) {
            plugins.push(plugin); // Agregar plugin a la lista
            //console.log(`Cargado plugin: ${plugin.name}`);
          }
        } catch (error) {
          console.error(`Error al cargar plugin en ${pluginPath}:`, error);
        }
      }
    }

    // Ordenar plugins alfabéticamente por nombre
    plugins.sort((a, b) => a.name.localeCompare(b.name));

    // Limpiar la base de datos de plugins que ya no existen en el sistema de archivos
    const existingPlugins = await pluginModel.findAll();
    const existingPluginNames = existingPlugins.map((plugin) => plugin.name);
    const pluginNamesInDirectory = plugins.map((plugin) => plugin.name);

    // Eliminar plugins de la base de datos que ya no están en el sistema de archivos
    for (const pluginName of existingPluginNames) {
      if (!pluginNamesInDirectory.includes(pluginName)) {
        await pluginModel.destroy({ where: { name: pluginName } });
      }
    }

    // Insertar los plugins ordenados, reiniciando el ID desde 1
    await pluginModel.destroy({ where: {} }); // Limpiar tabla antes de insertar
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      try {
        //console.log(`Insertando plugin: ${plugin.name}`);
        await pluginModel.create({
          id: i + 1,
          name: plugin.name,
          description: plugin.description || null,
          category: plugin.category || null,
          subcategory: plugin.subcategory || null,
          usage: plugin.usage || null,
          aliases: plugin.aliases ? plugin.aliases.join(",") : null,
        });
        pluginCount++;
      } catch (error) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `[${new Date().toLocaleString()}] Error al insertar plugin ${
            plugin.name
          }: ${error.message}`
        );
      }
    }

    //console.log(`Total de plugins insertados: ${pluginCount}`);
    return pluginCount;
  }

  // Método para contar el total de usuarios en la base de datos principal o de respaldo
  async countTotalUsers() {
    let totalUsers = 0;

    try {
      // Intentar contar en la base de datos principal
      totalUsers = await totoUser.count();
      totoroLog.info(
        "./logs/scripts/sync.log",
        `[${new Date().toLocaleString()}] - totalUsers: ${totalUsers}`
      );
    } catch (error) {
      totoroLog.error(
        "./logs/scripts/sync.log",
        `[${new Date().toLocaleString()}] Error al contar usuarios en la base de datos principal: ${
          error.message
        }`
      );

      try {
        // Si hay error, contar en la base de datos de respaldo
        totalUsers = await this.backupModels.totoUser.count();
        totoroLog.info(
          "./logs/scripts/sync.log",
          `[${new Date().toLocaleString()}] - totalUsers: ${totalUsers}`
        );
      } catch (backupError) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `[${new Date().toLocaleString()}] Error al contar usuarios en la base de datos de respaldo: ${
            backupError.message
          }`
        );
      }
    }

    return totalUsers;
  }
}

module.exports = totoDBSync;
