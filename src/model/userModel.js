const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "applicant", "company", "recruiter"),
      defaultValue: "applicant",
    },
    // Untuk recruiter: ID perusahaan tempat mereka bekerja (diset oleh admin/company)
    company_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = User;
