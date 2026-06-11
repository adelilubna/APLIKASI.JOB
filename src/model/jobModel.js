const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(160), allowNull: false },
    description: DataTypes.TEXT,
    location: DataTypes.STRING(120),
    job_type: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "internship", "freelance"),
      defaultValue: "full-time",
    },
    education_required: {
      type: DataTypes.ENUM("SMA/SMK", "D3", "S1", "S2", "S3"),
      allowNull: true,
    },
    experience_min_years: { type: DataTypes.INTEGER, defaultValue: 0 },
    salary_min: { type: DataTypes.BIGINT, allowNull: true },
    salary_max: { type: DataTypes.BIGINT, allowNull: true },
    required_skills: DataTypes.JSON,
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM("open", "closed"),
      defaultValue: "open",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Job;
