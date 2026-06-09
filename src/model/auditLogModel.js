const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    actor_user_id: { type: DataTypes.INTEGER, allowNull: true },
    entity_type: { type: DataTypes.STRING(40), allowNull: false },
    entity_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING(40), allowNull: false },
    from_status: DataTypes.STRING(40),
    to_status: DataTypes.STRING(40),
    meta: DataTypes.JSON,
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = AuditLog;
