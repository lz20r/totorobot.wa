const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoMantainance = tDB.sequelize.define(
  "totoMantainance",
  {
    maintenanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      defaultValue: 1, // Asumimos que solo habrá un registro
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
  },
  {
    tableName: "totoMantainance",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      afterSync: async (options) => {
        const count = await totoMantainance.count();
        if (count === 0) {
          await totoMantainance.create({ maintenanceId: 1, status: "off" }); // sera si está en mantenimiento es "on" y si no "off"
        }
      },
    },
  }
);

if (!totoMantainance) {
  totoroLog.error(
    "./logs/models/totoMantainance.log",
    "[MODELS] Error al crear el modelo totoMantainance."
  );
}

module.exports = totoMantainance;
