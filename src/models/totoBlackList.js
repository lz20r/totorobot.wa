const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const tDB = new TotoDB();
const totoUser = require("./totoUser");

const totoBlacklist = tDB.sequelize.define(
  "totoBlacklist",
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
  },
  {
    tableName: "totoBlacklist",
    timestamps: false,
  }
);
 
if(!totoBlacklist) {
  totoroLog.error(
    "./logs/models/totoBlacklist.log",
    "[MODELS] Error al crear el modelo totoBlacklist."
  );
}
module.exports = totoBlacklist;
