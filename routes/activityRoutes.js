const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/activity
// @desc    Get activity logs (Admin protected)
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find(30);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
});

module.exports = router;
