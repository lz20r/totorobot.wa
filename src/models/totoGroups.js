const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoGroups = tDB.sequelize.define(
  "totoGroups",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mantainanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
  },
  {
    tableName: "totoGroups",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoGroups) {
  totoroLog.error(
    "./logs/models/totoGroups.log",
    "[MODELS] Error al crear el modelo totoGroups."
  );
}

module.exports = totoGroups;
