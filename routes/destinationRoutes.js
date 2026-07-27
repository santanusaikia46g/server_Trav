const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { protect } = require('../middleware/auth');

// @route   GET /api/destinations
// @desc    Get all destinations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching destinations', error: error.message });
  }
});

// @route   POST /api/destinations
// @desc    Create a destination
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, image, description, bestTimeToVisit } = req.body;

  if (!name || !image || !description || !bestTimeToVisit) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const existing = await Destination.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Destination already exists' });
    }

    const savedDest = await Destination.create({
      name,
      image,
      description,
      bestTimeToVisit
    });

    res.status(201).json(savedDest);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating destination', error: error.message });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update a destination
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedDest = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    if (!updatedDest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(updatedDest);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating destination', error: error.message });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting destination', error: error.message });
  }
});

module.exports = router;
