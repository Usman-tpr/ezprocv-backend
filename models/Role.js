const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: {
        read: {
            type: Boolean,
            default: true
        },
        write: {
            type: Boolean,
            default: false
        },
        edit: {
            type: Boolean,
            default: false
        },
        delete: {
            type: Boolean,
            default: false
        },
        manageAdmins: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 