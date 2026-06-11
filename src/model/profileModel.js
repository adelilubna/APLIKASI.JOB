const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profile = sequelize.define(
  "Profile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    full_name: DataTypes.STRING(120),
    phone: DataTypes.STRING(20),
    gender: { type: DataTypes.ENUM("laki-laki", "perempuan"), allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    bio: DataTypes.TEXT,
    photo_url: DataTypes.STRING(255),
    location: DataTypes.STRING(120),
    education: DataTypes.STRING(200),
    education_level: {
      type: DataTypes.ENUM("SMA/SMK", "D3", "S1", "S2", "S3"),
      allowNull: true,
    },
    experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
    skills: DataTypes.JSON,
    cv_url: DataTypes.STRING(255),
    linkedin_url: DataTypes.STRING(255),
    github_url: DataTypes.STRING(255),
  },
  {
    tableName: "profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Profile;
