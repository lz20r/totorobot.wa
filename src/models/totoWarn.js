// models/totoWelcm.js
const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");
const totoroLog = require("../functions/totoroLog");
const TotoGroupSettings = require("./totoGroupSettings");

const tDB = new TotoDB();

const totoWarn = tDB.sequelize.define(
  "totoWarn",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true,
      references: {
        model: totoUser,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: 'phone',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    warnInfo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "{}",
    },
  },
  {
    tableName: "totoWarn",
    timestamps: false, 
  }
);

if (!totoWarn) {
  totoroLog.error(
    "./logs/models/totoWarn.log",
    "[MODELS] Error al crear el modelo totoWarn."
  );
}

totoWarn.belongsTo(TotoGroupSettings, {
  foreignKey: "groupId",
  targetKey: "groupId",
});

module.exports = totoWarn;
