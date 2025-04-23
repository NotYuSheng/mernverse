const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve all chat messages
 *     responses:
 *       200:
 *         description: A list of chat messages
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
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
