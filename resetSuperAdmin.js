const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Role = require('./models/Role');
require('dotenv').config();

const resetSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezprocv');
        console.log('Connected to MongoDB');

        // Find the super_admin role
        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        if (!superAdminRole) {
            console.error('Super admin role not found. Please run createRoles.js first.');
            process.exit(1);
        }

        // Delete existing super admin
        await Admin.deleteOne({ email: 'admin@ezprocv.com' });
        console.log('Existing super admin deleted');

        // Create new super admin
        const superAdmin = new Admin({
            name: 'Super Admin',
            email: 'admin@ezprocv.com',
            password: 'Admin@123',
            role: superAdminRole._id,
            isActive: true
        });

        await superAdmin.save();
        console.log('Super admin created successfully');
        console.log('Email: admin@ezprocv.com');
        console.log('Password: Admin@123');
        console.log('Role: super_admin');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting super admin:', error);
        process.exit(1);
    }
};

resetSuperAdmin(); 