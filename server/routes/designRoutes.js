const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const Design = require('../models/Design');

const router = express.Router();

// Get public or shared design by ID
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });
    res.json(design);
  } catch(err) {
    res.status(500).json({ error: 'Failed to find design' });
  }
});

// Get all designs for logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id }).sort('-updatedAt');
    res.json(designs);
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Save new or overwrite existing design
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, nodes, edges, isPublic } = req.body;
    const design = await Design.create({
      userId: req.user.id,
      name,
      nodes,
      edges,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    res.json(design);
  } catch(err) {
    res.status(500).json({ error: 'Failed to save design' });
  }
});

module.exports = router;
