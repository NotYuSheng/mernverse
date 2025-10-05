const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

/**
 * @swagger
 * /messages/{roomId}:
 *   get:
 *     summary: Retrieve chat messages for a specific room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: A list of chat messages for the room
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   message:
 *                     type: string
 *                   roomId:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
