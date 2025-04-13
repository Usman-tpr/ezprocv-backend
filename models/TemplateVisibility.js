const mongoose = require('mongoose');

const templateVisibilitySchema = new mongoose.Schema({
    templateNumber: {
        type: Number,
        unique: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to automatically set templateNumber
templateVisibilitySchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            // Find the highest templateNumber
            const lastTemplate = await this.constructor.findOne({}, {}, { sort: { 'templateNumber': -1 } });
            
            // If no templates exist, start with 1, otherwise increment by 1
            this.templateNumber = lastTemplate ? lastTemplate.templateNumber + 1 : 1;
            
            // Ensure the templateNumber is unique
            const existingTemplate = await this.constructor.findOne({ templateNumber: this.templateNumber });
            if (existingTemplate) {
                throw new Error('Template number conflict detected');
            }
            
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const TemplateVisibility = mongoose.model('TemplateVisibility', templateVisibilitySchema);

module.exports = TemplateVisibility; 