const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const totoUser = require("./totoUser");
const tDB = new TotoDB();

const totoRecordatorio = tDB.sequelize.define(
  "totoRecordatorio",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: totoUser,
        key: "phone",
      },
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remindAt: {
      type: DataTypes.DATE, // Fecha y hora para el recordatorio
      allowNull: false,
    },
    isNotified: {
      type: DataTypes.BOOLEAN, // Indica si el recordatorio ha sido notificado
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM, // Enum para tipos de recordatorios
      values: [
        "tarea",
        "evento",
        "fecha_importante",
        "medicamento",
        "mantenimiento",
        "recurrente",
        "motivacion",
        "alerta",
      ],
      allowNull: false,
    },
  },
  {
    tableName: "totoRecordatorio",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

// Manejo de errores al crear el modelo
if (!totoRecordatorio) {
  totoroLog.error(
    "./logs/models/totoRecordatorio.log",
    "[MODELS] Error al crear el modelo totoRecordatorio."
  );
}

module.exports = totoRecordatorio;
