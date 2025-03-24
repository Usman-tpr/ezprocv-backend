const EzAdmin = require('../models/Admin');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Get all available roles
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().select('name description permissions');
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new admin
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;
        
        // Check if creator is super admin
        if (req.admin.roleName !== 'super_admin') {
            return res.status(403).json({ message: 'Only super admin can create new admins' });
        }

        // Check if email already exists
        const existingAdmin = await EzAdmin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Validate role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const admin = new EzAdmin({
            name,
            email,
            password,
            role: roleId,
            createdBy: req.admin._id
        });

        await admin.save();

        // Populate role data for response
        const populatedAdmin = await EzAdmin.findById(admin._id).populate('role');

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: populatedAdmin._id,
                name: populatedAdmin.name,
                email: populatedAdmin.email,
                role: populatedAdmin.role.name,
                permissions: populatedAdmin.role.permissions
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin login
const adminLogin = async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ 
                message: 'Email and password are required',
                received: { email: !!email, password: !!password }
            });
        }

        const admin = await EzAdmin.findOne({ email }).populate('role');
        console.log('Admin found:', admin ? 'Yes' : 'No');
        
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        const isMatch = await admin.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Get role name safely
        const roleName = admin.role ? admin.role.name : 'viewer';
        const rolePermissions = admin.role ? admin.role.permissions : {};

        const token = jwt.sign(
            { 
                adminId: admin._id,
                role: roleName,
                permissions: rolePermissions
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: roleName,
                permissions: rolePermissions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        // Check if admin has permission to manage other admins
        if (!req.admin.permissions.manageAdmins) {
            return res.status(403).json({ message: 'Not authorized to view admin list' });
        }

        const admins = await EzAdmin.find()
            .select('-password')
            .populate('role')
            .populate('createdBy', 'name email');
        
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single admin
const getAdminById = async (req, res) => {
    try {
        // Check if admin has permission to manage other admins
        if (!req.admin.permissions.manageAdmins) {
            return res.status(403).json({ message: 'Not authorized to view admin details' });
        }

        const admin = await EzAdmin.findById(req.params.id)
            .select('-password')
            .populate('role')
            .populate('createdBy', 'name email');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    try {
        const { name, email, roleId, isActive } = req.body;
        
        // Check if admin has permission to manage other admins
        if (!req.admin.permissions.manageAdmins) {
            return res.status(403).json({ message: 'Not authorized to update admin' });
        }

        const admin = await EzAdmin.findById(req.params.id).populate('role');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Only super admin can update other super admins
        if (admin.role && admin.role.name === 'super_admin' && req.admin.roleName !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update super admin' });
        }

        // If role is being updated, validate the new role
        if (roleId) {
            const newRole = await Role.findById(roleId);
            if (!newRole) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            admin.role = roleId;
        }

        admin.name = name || admin.name;
        admin.email = email || admin.email;
        admin.isActive = isActive !== undefined ? isActive : admin.isActive;

        await admin.save();

        // Populate role data for response
        const updatedAdmin = await EzAdmin.findById(admin._id).populate('role');

        res.json({
            message: 'Admin updated successfully',
            admin: {
                id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: updatedAdmin.role.name,
                permissions: updatedAdmin.role.permissions,
                isActive: updatedAdmin.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        // Check if admin has permission to manage other admins
        if (!req.admin.permissions.manageAdmins) {
            return res.status(403).json({ message: 'Not authorized to delete admin' });
        }

        const admin = await EzAdmin.findById(req.params.id).populate('role');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Prevent deleting super admin
        if (admin.role && admin.role.name === 'super_admin') {
            return res.status(403).json({ message: 'Cannot delete super admin' });
        }

        await EzAdmin.deleteOne({ _id: req.params.id });
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getRoles,
    createAdmin,
    adminLogin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
}; 