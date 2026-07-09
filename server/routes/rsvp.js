const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/rsvp', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const eventId = req.params.id;
        const userId = req.user.id;

        if (!['going', 'maybe', 'not_going'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const eventCheck = await query('SELECT id FROM events WHERE id = $1', [eventId]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        await query(
            `INSERT INTO rsvps (event_id, user_id, status)
             VALUES ($1, $2, $3)
             ON CONFLICT (event_id, user_id)
             DO UPDATE SET status = $3, created_at = NOW()`,
            [eventId, userId, status]
        );

        const countResult = await query(
            `SELECT status, COUNT(*) as count FROM rsvps WHERE event_id = $1 GROUP BY status`,
            [eventId]
        );

        const counts = { going: 0, maybe: 0, not_going: 0 };
        countResult.rows.forEach(row => { counts[row.status] = parseInt(row.count); });

        res.json({ success: true, data: { user_status: status, counts } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to RSVP' });
    }
});

router.get('/:id/rsvps', async (req, res) => {
    try {
        const result = await query(
            `SELECT r.status, r.created_at, u.id, u.name, u.avatar_url
             FROM rsvps r
             JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch RSVPs' });
    }
});

router.get('/:id/my-rsvp', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            'SELECT status FROM rsvps WHERE event_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.json({ success: true, data: { status: null } });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch RSVP' });
    }
});

module.exports = router;
