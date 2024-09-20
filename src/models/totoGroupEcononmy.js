const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoGroupEcononmy = tDB.sequelize.define(
  "totoGroupEcononmy",
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
    economyId: {
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
    tableName: "totoGroupEcononmy",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoGroupEcononmy) {
  totoroLog.error(
    "./logs/models/totoGroupEcononmy.log",
    "[MODELS] Error al crear el modelo totoGroupEcononmy."
  );
}

module.exports = totoGroupEcononmy;
