const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profile = sequelize.define(
  "Profile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    full_name: DataTypes.STRING(120),
    location: DataTypes.STRING(120),
    education: DataTypes.STRING(120),
    experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
    skills: DataTypes.JSON,
    cv_url: DataTypes.STRING(255),
  },
  {
    tableName: "profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Profile;
