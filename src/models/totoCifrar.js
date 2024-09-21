const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoCifrar = tDB.sequelize.define(
  "totoCifrar",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: totoUser,
        key: 'id',
      },
      allowNull: false,
      unique: true,  // Hace que userId sea único
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: "totoCifrar",
    timestamps: false,
  }
);

// Establecer las asociaciones
totoUser.hasMany(totoCifrar, {
  foreignKey: "userId",
});
totoCifrar.belongsTo(totoUser, {
  foreignKey: "userId",
});

if (!totoCifrar) {
  totoroLog.error(
    "./logs/models/totoCifrar.log",
    "[MODELS] Error al crear el modelo totoCifrar."
  );
}

module.exports = totoCifrar;
