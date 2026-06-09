const pool = require("../config/db");

async function createAuditLog({ actorUserId, entityType, entityId, action, fromStatus, toStatus, meta }) {
  const sql = `
    INSERT INTO audit_logs (actor_user_id, entity_type, entity_id, action, from_status, to_status, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const metaJson = meta ? JSON.stringify(meta) : null;
  const [result] = await pool.execute(sql, [
    actorUserId || null,
    entityType,
    entityId,
    action,
    fromStatus || null,
    toStatus || null,
    metaJson,
  ]);
  return result.insertId;
}

module.exports = { createAuditLog };

