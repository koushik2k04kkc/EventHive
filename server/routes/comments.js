const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:id/comments', async (req, res) => {
    try {
        const result = await query(
            `SELECT c.id, c.content, c.created_at, u.id as user_id, u.name, u.avatar_url
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.event_id = $1
             ORDER BY c.created_at ASC`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch comments' });
    }
});

router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const eventId = req.params.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Content is required' });
        }

        const eventCheck = await query('SELECT id FROM events WHERE id = $1', [eventId]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        const result = await query(
            `INSERT INTO comments (event_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [eventId, req.user.id, content.trim()]
        );

        const userResult = await query(
            'SELECT id, name, avatar_url FROM users WHERE id = $1',
            [req.user.id]
        );

        const comment = {
            ...result.rows[0],
            user_id: req.user.id,
            name: userResult.rows[0].name,
            avatar_url: userResult.rows[0].avatar_url
        };

        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to post comment' });
    }
});

router.delete('/:eventId/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const check = await query(
            'SELECT user_id FROM comments WHERE id = $1 AND event_id = $2',
            [req.params.commentId, req.params.eventId]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comment not found' });
        }
        if (check.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await query('DELETE FROM comments WHERE id = $1', [req.params.commentId]);
        res.json({ success: true, data: { message: 'Comment deleted' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to delete comment' });
    }
});

module.exports = router;
