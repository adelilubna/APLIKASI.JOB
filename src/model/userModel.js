const pool = require("../config/db");

async function createUser({ email, passwordHash, role }) {
  const sql = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
  const [result] = await pool.execute(sql, [email, passwordHash, role]);
  return result.insertId;
}

async function findUserByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const sql = "SELECT id, email, role FROM users WHERE id = ? LIMIT 1";
  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById };