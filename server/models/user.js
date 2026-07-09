const { query } = require('../config/database');

const findByEmail = async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

const findById = async (id) => {
    const result = await query(
        'SELECT id, name, email, bio, avatar_url, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

const create = async (name, email, passwordHash) => {
    const result = await query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email, passwordHash]
    );
    return result.rows[0];
};

const updateProfile = async (id, updates) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (updates.name) { fields.push(`name = $${index++}`); values.push(updates.name); }
    if (updates.bio !== undefined) { fields.push(`bio = $${index++}`); values.push(updates.bio); }
    if (updates.avatar_url) { fields.push(`avatar_url = $${index++}`); values.push(updates.avatar_url); }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, name, email, bio, avatar_url, created_at`,
        values
    );
    return result.rows[0] || null;
};

module.exports = { findByEmail, findById, create, updateProfile };
