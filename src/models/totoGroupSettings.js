const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoGroupSettings = tDB.sequelize.define(
  "totoGroupSettings",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
  },
  {
    tableName: "totoGroupSettings",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoGroupSettings) {
  totoroLog.error(
    "./logs/models/totoGroupSettings.log",
    "[MODELS] Error al crear el modelo totoGroupSettings."
  );
}

module.exports = totoGroupSettings;
