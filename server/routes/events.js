const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let sql = `
            SELECT e.*, u.name as creator_name,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as attendee_count
            FROM events e
            JOIN users u ON e.created_by = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (category && category !== 'all') {
            sql += ` AND e.category = $${paramIndex++}`;
            params.push(category);
        }

        if (search) {
            sql += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex} OR e.location ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (sort === 'date') {
            sql += ` ORDER BY e.event_date ASC`;
        } else if (sort === 'newest') {
            sql += ` ORDER BY e.created_at DESC`;
        } else {
            sql += ` ORDER BY e.event_date ASC`;
        }

        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const eventResult = await query(
            `SELECT e.*, u.name as creator_name, u.email as creator_email, u.avatar_url as creator_avatar,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as going_count,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'maybe') as maybe_count,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'not_going') as not_going_count
             FROM events e
             JOIN users u ON e.created_by = u.id
             WHERE e.id = $1`,
            [req.params.id]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.json({ success: true, data: eventResult.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, location, event_date, category, max_attendees, banner_url } = req.body;

        if (!title || !event_date) {
            return res.status(400).json({ success: false, error: 'Title and event date are required' });
        }

        const result = await query(
            `INSERT INTO events (title, description, location, event_date, category, max_attendees, banner_url, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [title, description || '', location || '', event_date, category || '', max_attendees || 0, banner_url || '', req.user.id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to create event' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const check = await query('SELECT created_by FROM events WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        if (check.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const { title, description, location, event_date, category, max_attendees, banner_url, status } = req.body;
        const result = await query(
            `UPDATE events SET title = $1, description = $2, location = $3, event_date = $4,
             category = $5, max_attendees = $6, banner_url = $7, status = $8
             WHERE id = $9 RETURNING *`,
            [title, description, location, event_date, category, max_attendees, banner_url, status, req.params.id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to update event' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const check = await query('SELECT created_by FROM events WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        if (check.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await query('DELETE FROM events WHERE id = $1', [req.params.id]);
        res.json({ success: true, data: { message: 'Event deleted' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
});

module.exports = router;
