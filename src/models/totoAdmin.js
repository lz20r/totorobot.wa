const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");
const totoroLog = require("../functions/totoroLog");
const { sendError } = require("../functions/messages");

const tDB = new TotoDB();

const totoAdmin = tDB.sequelize.define(
  "totoAdmin",
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
    tableName: "totoAdmins",
    timestamps: false,
  }
);

totoUser.hasMany(totoAdmin, { foreignKey: "phone" });
totoAdmin.belongsTo(totoUser, { foreignKey: "phone" });

if (!totoAdmin) {
  totoroLog.error(
    "./logs/models/totoAdmin.log",
    "[MODELS] Error al crear el modelo totoAdmin."
  );
}
module.exports = totoAdmin;
