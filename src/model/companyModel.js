const pool = require("../config/db");

const Company = {
  getAll: () => pool.execute("SELECT * FROM companies ORDER BY created_at DESC"),

  getById: (id) => pool.execute("SELECT * FROM companies WHERE id = ? LIMIT 1", [id]),

  getByOwnerUserId: (owner_user_id) =>
    pool.execute(
      "SELECT * FROM companies WHERE owner_user_id = ? ORDER BY created_at DESC",
      [owner_user_id]
    ),

  create: (data) =>
    pool.execute(
      "INSERT INTO companies (owner_user_id, name, email, description, website, location) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.owner_user_id,
        data.name,
        data.email || null,
        data.description || null,
        data.website || null,
        data.location || null,
      ]
    ),

  update: (id, data) =>
    pool.execute(
      "UPDATE companies SET name = ?, email = ?, description = ?, website = ?, location = ? WHERE id = ?",
      [
        data.name,
        data.email || null,
        data.description || null,
        data.website || null,
        data.location || null,
        id,
      ]
    ),

  delete: (id) => pool.execute("DELETE FROM companies WHERE id = ?", [id]),
};

module.exports = Company;
