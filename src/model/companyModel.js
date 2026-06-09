const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Company = sequelize.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    owner_user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    email: DataTypes.STRING(120),
    description: DataTypes.TEXT,
    website: DataTypes.STRING(255),
    location: DataTypes.STRING(120),
    is_verified: { type: DataTypes.TINYINT, defaultValue: 0 },
  },
  {
    tableName: "companies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Company;
