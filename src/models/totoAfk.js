const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const tDB = new TotoDB();
const totoUser = require("./totoUser");

const totoAfk = tDB.sequelize.define(
  "totoAfk",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: totoUser,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: "phone",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "No AFK", // Puedes ajustar el valor predeterminado según sea necesario
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mentOnAFK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "totoAfk",
    timestamps: false,
  }
);

if(!totoAfk) {
  totoroLog.error(
    "./logs/models/totoAfk.log",
    "[MODELS] Error al crear el modelo totoAfk."
  );
}

module.exports = totoAfk;
