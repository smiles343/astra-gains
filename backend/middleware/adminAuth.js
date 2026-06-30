const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = adminAuth;
