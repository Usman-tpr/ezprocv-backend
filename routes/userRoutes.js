const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    getTotalUsers
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/total', getTotalUsers);

// Protected routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

module.exports = router; 