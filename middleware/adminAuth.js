const jwt = require('jsonwebtoken');
const EzAdmin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Populate the role data when fetching the admin
        const admin = await EzAdmin.findById(decoded.adminId).populate('role');
        // console.log('Admin data:', {
        //     id: admin._id,
        //     name: admin.name,
        //     email: admin.email,
        //     role: admin.role,
        //     isActive: admin.isActive
        // });

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Admin account is deactivated' });
        }

        // Add role name and permissions to admin object for easier access
        admin.roleName = admin.role ? admin.role.name : 'viewer';
        admin.permissions = admin.role ? admin.role.permissions : {};

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check if admin is super admin
const isSuperAdmin = (req, res, next) => {
    if (req.admin.roleName !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }
    next();
};

// Middleware to check specific permissions
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin.permissions[permission]) {
            return res.status(403).json({ message: `Access denied. ${permission} permission required.` });
        }
        next();
    };
};

module.exports = {
    adminAuth,
    isSuperAdmin,
    checkPermission
}; 