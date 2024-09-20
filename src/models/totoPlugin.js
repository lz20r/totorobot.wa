const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoPlugin = tDB.sequelize.define(
  "totoPlugin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Hacer que el campo sea auto-incremental
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Asegurando que el nombre sea único
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aliases: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "totoPlugins",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

if (!totoPlugin) {
  totoroLog.error(
    "./logs/models/totoPlugin.log",
    "[MODELS] Error al crear el modelo totoPlugin."
  );
}

module.exports = totoPlugin;
