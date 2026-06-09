const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(160), allowNull: false },
    description: DataTypes.TEXT,
    location: DataTypes.STRING(120),
    required_skills: DataTypes.JSON,
    status: {
      type: DataTypes.ENUM("open", "closed"),
      defaultValue: "open",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Job;
