const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoAntilinks = tDB.sequelize.define(
  "totoAntilinks",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
  },
  {
    tableName: "totoAntilinks",
    timestamps: false, 
  }
);


if (!totoAntilinks) {
  totoroLog.error(
    "./logs/models/totoAntilinks.log",
    "[MODELS] Error al crear el modelo totoAntilinks."
  );
}

module.exports = totoAntilinks;