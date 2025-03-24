const mongoose = require('mongoose');
const Role = require('./models/Role');
require('dotenv').config();

const predefinedRoles = [
    {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true,
            manageAdmins: true
        }
    },
    {
        name: 'content_admin',
        description: 'Content Administrator with full content management access',
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true,
            manageAdmins: false
        }
    },
    {
        name: 'editor',
        description: 'Editor with content editing and publishing access',
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: false,
            manageAdmins: false
        }
    },
    {
        name: 'viewer',
        description: 'Viewer with read-only access',
        permissions: {
            read: true,
            write: false,
            edit: false,
            delete: false,
            manageAdmins: false
        }
    }
];

const createRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ezprocv");
        console.log('Connected to MongoDB');

        // Create roles
        for (const roleData of predefinedRoles) {
            const existingRole = await Role.findOne({ name: roleData.name });
            
            if (existingRole) {
                console.log(`Role ${roleData.name} already exists`);
                continue;
            }

            const role = new Role(roleData);
            await role.save();
            console.log(`Role ${roleData.name} created successfully`);
        }

        console.log('All roles created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating roles:', error);
        process.exit(1);
    }
};

createRoles(); 