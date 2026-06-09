const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Shortlist = sequelize.define(
  "Shortlist",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    application_id: { type: DataTypes.INTEGER, allowNull: false },
    recruiter_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "shortlists",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["application_id", "recruiter_id"] }],
  }
);

module.exports = Shortlist;
