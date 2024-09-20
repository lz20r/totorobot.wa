const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const totoGroupSettings = require("./totoGroupSettings");

const tDB = new TotoDB();
const totoWelcm = tDB.sequelize.define(
  "totoWelcm",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoGroupSettings,
        key: "groupId",
      },
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM,
      values: ["join", "leave"],
      allowNull: false,
    },
  },
  {
    tableName: "totoWelcm",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoWelcm) {
  totoroLog.error(
    "./logs/models/totoWelcm.log",
    "[MODELS] Error al crear el modelo totoWelcm."
  );
}

module.exports = totoWelcm;
