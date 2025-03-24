const express = require('express');
const router = express.Router();
const { adminAuth, isSuperAdmin, checkPermission } = require('../middleware/adminAuth');
const {
    createAdmin,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    getRoles
} = require('../controllers/adminController');

// Public routes
router.post('/login', adminLogin);

// Protected routes

router.get('/roles', adminAuth, getRoles);
router.get('/', adminAuth, checkPermission('manageAdmins'), getAllAdmins);
router.get('/:id', adminAuth, checkPermission('manageAdmins'), getAdminById);
router.post('/', adminAuth, isSuperAdmin, createAdmin);
router.put('/:id', adminAuth, checkPermission('manageAdmins'), updateAdmin);
router.delete('/:id', adminAuth, checkPermission('manageAdmins'), deleteAdmin);

module.exports = router; 