const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const userResult = await query(
            'SELECT id, name, email, bio, avatar_url, created_at FROM users WHERE id = $1',
            [req.params.id]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: userResult.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

router.get('/:id/events', async (req, res) => {
    try {
        const result = await query(
            `SELECT e.*, u.name as creator_name,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as attendee_count
             FROM events e
             JOIN users u ON e.created_by = u.id
             WHERE e.created_by = $1
             ORDER BY e.event_date ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
});

router.get('/:id/rsvps', async (req, res) => {
    try {
        const result = await query(
            `SELECT e.*, u.name as creator_name, r.status as rsvp_status,
                (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as attendee_count
             FROM rsvps r
             JOIN events e ON r.event_id = e.id
             JOIN users u ON e.created_by = u.id
             WHERE r.user_id = $1
             ORDER BY e.event_date ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch RSVPs' });
    }
});

module.exports = router;
