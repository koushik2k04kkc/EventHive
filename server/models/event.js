const { query } = require('../config/database');

const getAll = async (filters = {}) => {
    const { category, search, sort } = filters;
    let sql = `
        SELECT e.*, u.name as creator_name,
            (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as attendee_count
        FROM events e
        JOIN users u ON e.created_by = u.id
        WHERE 1=1
    `;
    const params = [];
    let index = 1;

    if (category && category !== 'all') {
        sql += ` AND e.category = $${index++}`;
        params.push(category);
    }
    if (search) {
        sql += ` AND (e.title ILIKE $${index} OR e.description ILIKE $${index})`;
        params.push(`%${search}%`);
        index++;
    }

    sql += sort === 'newest' ? ` ORDER BY e.created_at DESC` : ` ORDER BY e.event_date ASC`;

    const result = await query(sql, params);
    return result.rows;
};

const getById = async (id) => {
    const result = await query(
        `SELECT e.*, u.name as creator_name, u.email as creator_email, u.avatar_url as creator_avatar,
            (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as going_count,
            (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'maybe') as maybe_count,
            (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'not_going') as not_going_count
         FROM events e
         JOIN users u ON e.created_by = u.id
         WHERE e.id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

const create = async (data, userId) => {
    const { title, description, location, event_date, category, max_attendees, banner_url } = data;
    const result = await query(
        `INSERT INTO events (title, description, location, event_date, category, max_attendees, banner_url, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, description || '', location || '', event_date, category || '', max_attendees || 0, banner_url || '', userId]
    );
    return result.rows[0];
};

const update = async (id, data) => {
    const { title, description, location, event_date, category, max_attendees, banner_url, status } = data;
    const result = await query(
        `UPDATE events SET title = $1, description = $2, location = $3, event_date = $4,
         category = $5, max_attendees = $6, banner_url = $7, status = $8
         WHERE id = $9 RETURNING *`,
        [title, description, location, event_date, category, max_attendees, banner_url, status, id]
    );
    return result.rows[0] || null;
};

const remove = async (id) => {
    await query('DELETE FROM events WHERE id = $1', [id]);
    return true;
};

const getByUser = async (userId) => {
    const result = await query(
        `SELECT e.*, u.name as creator_name,
            (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as attendee_count
         FROM events e
         JOIN users u ON e.created_by = u.id
         WHERE e.created_by = $1
         ORDER BY e.event_date ASC`,
        [userId]
    );
    return result.rows;
};

module.exports = { getAll, getById, create, update, remove, getByUser };
