const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Interview = sequelize.define(
  "Interview",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    application_id: { type: DataTypes.INTEGER, allowNull: false },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    meeting_link: DataTypes.STRING(255),
    location: DataTypes.STRING(255),
    notes: DataTypes.TEXT,
  },
  {
    tableName: "interviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Interview;
