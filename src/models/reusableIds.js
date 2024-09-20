// Crear un archivo en `models/reusableIds.js`

const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB"); // Aquí ya tienes la conexión con la base de datos
const tDB = new TotoDB();

// Definir el modelo reusableIds
const reusableIds = tDB.sequelize.define(
  "reusableIds",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    tableName: "reusableIds",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

module.exports = reusableIds;
