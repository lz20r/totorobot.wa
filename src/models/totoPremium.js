const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const totoUser = require("./totoUser");

const tDB = new TotoDB();

const totoPremium = tDB.sequelize.define(
  "totoPremium",
  {
    totoUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: totoUser,
        key: "id",
      },
    },
    totoLicense: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    }, 
  },
  {
    tableName: "totoPremiumUsers",
    timestamps: false,
  }
);

if (!totoPremium) {
  totoroLog.error(
    "./logs/models/totoPremium.log",
    "[MODELS] Error al crear el modelo totoPremium."
  );
}

module.exports = totoPremium;
