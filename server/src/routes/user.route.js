const express = require('express')
const router = express.Router()
const authMiddleware = require('../Middleware/auth.middleware')
const User = require('../models/user.model')

// Get all users except the logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.userId } },
      { password: 0 }   // exclude password
    )
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router