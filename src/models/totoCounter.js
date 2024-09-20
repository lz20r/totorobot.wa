// models/totoCounter.js

const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const totoUser = require("./totoUser");
const totoPlugin = require("./totoPlugin");

const tDB = new TotoDB();

const totoCounter = tDB.sequelize.define(
  "totoCounter",
  {
    totoUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: totoUser,
        key: 'id'
      }
    },
    pluginName: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoPlugin,
        key: 'name'
      }
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  },
  {
    tableName: "totoCounters",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoCounter) {
  totoroLog.error(
    "./logs/models/totoCounter.log",
    "[MODELS] Error al crear el modelo totoCounter."
  );
}

module.exports = totoCounter;
