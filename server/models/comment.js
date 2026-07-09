const { query } = require('../config/database');

const getByEvent = async (eventId) => {
    const result = await query(
        `SELECT c.id, c.content, c.created_at, u.id as user_id, u.name, u.avatar_url
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.event_id = $1
         ORDER BY c.created_at ASC`,
        [eventId]
    );
    return result.rows;
};

const create = async (eventId, userId, content) => {
    const result = await query(
        `INSERT INTO comments (event_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, content, created_at`,
        [eventId, userId, content]
    );
    return result.rows[0];
};

const remove = async (commentId) => {
    await query('DELETE FROM comments WHERE id = $1', [commentId]);
    return true;
};

module.exports = { getByEvent, create, remove };
