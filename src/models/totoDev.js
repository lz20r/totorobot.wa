const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoDev = tDB.sequelize.define(
  "totoDev",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: "phone",
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
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
    tableName: "totoDevs",
    timestamps: false,
  }
);

totoUser.hasMany(totoDev, { foreignKey: "phone" });
totoDev.belongsTo(totoUser, { foreignKey: "phone" });

if (!totoDev) {
  totoroLog.error(
    "./logs/models/totoDev.log",
    "[MODELS] Error al crear el modelo totoDev."
  );
}

module.exports = totoDev;
