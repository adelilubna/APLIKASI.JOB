const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    applicant_user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("Applied", "Reviewed", "Shortlist", "Interview", "Accepted", "Rejected"),
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
