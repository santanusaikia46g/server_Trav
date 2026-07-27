const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { protect } = require('../middleware/auth');

// @route   GET /api/packages
// @desc    Get all packages with optional search/filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { destination, category, maxPrice, duration, search } = req.query;
    const packages = await Package.find({ destination, category, maxPrice, duration, search });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching packages', error: error.message });
  }
});

// @route   GET /api/packages/:id
// @desc    Get a single package by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching package', error: error.message });
  }
});

// @route   POST /api/packages
// @desc    Create a new package
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, price, duration, destination, category, images, itinerary, included, excluded } = req.body;

  if (!title || !description || !price || !duration || !destination) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const savedPackage = await Package.create({
      title,
      description,
      price,
      duration,
      destination,
      category: category || 'Standard',
      images: images || [],
      itinerary: itinerary || [],
      included: included || [],
      excluded: excluded || []
    });

    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating package', error: error.message });
  }
});

// @route   PUT /api/packages/:id
// @desc    Update a package
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating package', error: error.message });
  }
});

// @route   DELETE /api/packages/:id
// @desc    Delete a package
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting package', error: error.message });
  }
});

module.exports = router;
