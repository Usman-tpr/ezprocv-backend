const express = require('express');
const router = express.Router();
const { adminAuth, checkPermission } = require('../middleware/adminAuth');
const upload = require('../middleware/multer');
const {
    getAllTemplates,
    updateTemplateVisibility,
    createTemplate,
    createInitialTemplates,
    deleteTemplate
} = require('../controllers/templateVisibilityController');

// Protected routes
router.get('/',  getAllTemplates);
router.put('/:templateNumber', adminAuth, checkPermission('edit'), updateTemplateVisibility);
router.post('/initialize', adminAuth, checkPermission('write'), createInitialTemplates);
router.post('/', adminAuth, checkPermission('write'), upload.single('image'), createTemplate);
router.delete('/:templateNumber', adminAuth, checkPermission('delete'), deleteTemplate);

module.exports = router; 