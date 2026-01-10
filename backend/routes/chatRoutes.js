const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/chatService');
const { protect } = require('../middleware/authMiddleware');

// Chat endpoint - supports both authenticated and unauthenticated users
router.post('/', async (req, res) => {
    try {
        const { message, conversationContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Extract userId from token if authenticated (optional)
        let userId = null;
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token invalid or expired - continue as unauthenticated
                console.log("Invalid/expired token, continuing as guest");
            }
        }

        // Call chat service with userId and context
        const result = await getChatResponse(message, userId, conversationContext || {});

        // Return response with booking status
        res.json({
            reply: result.reply || result,
            bookingCreated: result.bookingCreated || false,
            booking: result.booking || null,
            pendingBooking: result.pendingBooking || null
        });
    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Authenticated chat endpoint (for booking features)
router.post('/auth', protect, async (req, res) => {
    try {
        const { message, conversationContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const result = await getChatResponse(message, req.user._id, conversationContext || {});

        res.json({
            reply: result.reply || result,
            bookingCreated: result.bookingCreated || false,
            booking: result.booking || null,
            pendingBooking: result.pendingBooking || null
        });
    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
