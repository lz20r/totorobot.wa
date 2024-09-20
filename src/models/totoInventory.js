const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const tDB = new TotoDB();
const totoUser = require("./totoUser");

const totoInventory = tDB.sequelize.define(
  "totoInventory",
  {
    userPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: "phone",
      },
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    origin: {
      type: DataTypes.ENUM("comprado", "encontrado"),
      defaultValue: "comprado",
      allowNull: false,
    },
  },
  {
    tableName: "totoInventory",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

module.exports = totoInventory;
