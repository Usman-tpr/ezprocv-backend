const TemplateVisibility = require('../models/TemplateVisibility');
const path = require('path');
const fs = require('fs');

// Get all templates visibility status
const getAllTemplates = async (req, res) => {
    try {
        const templates = await TemplateVisibility.find().sort({ templateNumber: 1 });
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update template visibility
const updateTemplateVisibility = async (req, res) => {
    try {
        const { templateNumber } = req.params;
        const { isVisible } = req.body;

        const template = await TemplateVisibility.findOneAndUpdate(
            { templateNumber },
            { isVisible },
            { new: true }
        );

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error updating template visibility:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete template
const deleteTemplate = async (req, res) => {
    try {
        const { templateNumber } = req.params;

        // Find the template first to get the image path
        const template = await TemplateVisibility.findOne({ templateNumber });
        
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Delete the image file if it exists
        if (template.image) {
            const imagePath = path.join(__dirname, '..', template.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete the template from database
        await TemplateVisibility.deleteOne({ templateNumber });

        res.json({ 
            message: 'Template deleted successfully',
            deletedTemplate: {
                templateNumber: template.templateNumber,
                name: template.name
            }
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new template
const createTemplate = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Template image is required' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        // Create new template
        const template = new TemplateVisibility({
            name,
            image: imageUrl,
            isVisible: true
        });

        // Save the template - this will trigger the pre-save middleware
        await template.save();

        res.status(201).json({
            message: 'Template created successfully',
            template: {
                templateNumber: template.templateNumber,
                name: template.name,
                image: template.image,
                isVisible: template.isVisible,
                createdAt: template.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating template:', error);
        if (error.message === 'Template number conflict detected') {
            return res.status(409).json({ message: 'Error generating template number. Please try again.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Create initial templates (if they don't exist)
const createInitialTemplates = async (req, res) => {
    try {
        const templates = [];
        for (let i = 1; i <= 12; i++) {
            templates.push({
                templateNumber: i,
                name: `Template ${i}`,
                image: `/uploads/default-template-${i}.jpg`,
                isVisible: true
            });
        }

        const existingTemplates = await TemplateVisibility.find();
        if (existingTemplates.length === 0) {
            await TemplateVisibility.insertMany(templates);
            res.json({ message: 'Initial templates created successfully' });
        } else {
            res.json({ message: 'Templates already exist' });
        }
    } catch (error) {
        console.error('Error creating initial templates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllTemplates,
    updateTemplateVisibility,
    createTemplate,
    createInitialTemplates,
    deleteTemplate
}; 