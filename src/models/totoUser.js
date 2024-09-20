const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoUser = tDB.sequelize.define(
  "totoUser",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 9,
        max: 70,
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: true,
      },
    },
    registered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    serialNumber: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'whitelist', // Por defecto, los usuarios están en la lista blanca
      validate: {
        isIn: [['whitelist', 'blacklist']],
      },
    },
  },
  {
    tableName: "totoUsers",
    timestamps: false,
  }
);

if (!totoUser) {
  totoroLog.error(
    "./logs/models/totoUser.log",
    "[MODELS] Error al crear el modelo totoUser."
  );
}

module.exports = totoUser;
