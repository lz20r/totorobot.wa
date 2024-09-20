const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoStatus = tDB.sequelize.define(
  "totoStatus",
  {
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "on",
    },
  },
  {
    tableName: "totoStatus",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      afterSync: async (options) => {
        const count = await totoStatus.count();
        if (count === 0) {
          await totoStatus.create({ statusId: 1, status: "on" });
        }
      },
    },
  }
);

if (!totoStatus) {
  totoroLog.error(
    "./logs/models/totoStatus.log",
    "[MODELS] Error al crear el modelo totoStatus."
  );
}

module.exports = totoStatus;
