const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Company = sequelize.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    owner_user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    email: DataTypes.STRING(120),
    phone: DataTypes.STRING(20),
    description: DataTypes.TEXT,
    website: DataTypes.STRING(255),
    location: DataTypes.STRING(120),
    industry: DataTypes.STRING(100),
    company_size: {
      type: DataTypes.ENUM("1-10", "11-50", "51-200", "201-500", "500+"),
      allowNull: true,
    },
    logo_url: DataTypes.STRING(255),
    is_verified: { type: DataTypes.TINYINT, defaultValue: 0 },
  },
  {
    tableName: "companies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Company;
