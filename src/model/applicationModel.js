const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    applicant_user_id: { type: DataTypes.INTEGER, allowNull: false },
    cover_letter: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("Applied", "Reviewed", "Interview", "Accepted", "Rejected"),
      defaultValue: "Applied",
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["job_id", "applicant_user_id"] }],
  }
);

module.exports = Application;
