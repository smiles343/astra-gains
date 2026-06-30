const express = require('express');
const router = express.Router();
const cheapgainAPI = require('../utils/cheapgainAPI');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await cheapgainAPI.getServices();
    
    res.json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
