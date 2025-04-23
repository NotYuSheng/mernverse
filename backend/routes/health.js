const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Returns the health status of the backend
 */
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MERNverse backend is healthy' });
});

module.exports = router;
