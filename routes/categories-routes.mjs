import express from 'express';
import { getAllCategories, addCategory, getProductsByCategoryId, getCategoryById } from '../controllers/categories-controller.mjs';
import checkAdmin from '../middleware/check-admin.mjs';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);
router.get('/products/:categoryId', getProductsByCategoryId);

// Admin routes
router.use(checkAdmin);
router.post('/add-category', addCategory);

export default router;
