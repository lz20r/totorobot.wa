// models/totoWelcm.js
const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const TotoGroupSettings = require("./totoGroupSettings");

const tDB = new TotoDB();

const totoWelcm = tDB.sequelize.define(
  "totoWelcm",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TotoGroupSettings,
        key: "groupId",
      },
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
  }
);

if (!totoWelcm) {
  totoroLog.error(
    "./logs/models/totoWelcm.log",
    "[MODELS] Error al crear el modelo totoWelcm."
  );
}

totoWelcm.belongsTo(TotoGroupSettings, {
  foreignKey: "groupId",
  targetKey: "groupId",
});

module.exports = totoWelcm;
