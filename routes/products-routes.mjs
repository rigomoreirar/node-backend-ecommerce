import express from 'express';
import bodyParser from 'body-parser';

import { getProductById, getProductsTrend, getProductsByBestSeller, getProductsBySearch,
    addProduct, modifyProduct, deleteProduct } from '../controllers/products-controller.mjs';
import checkAdmin from '../middleware/check-admin.mjs';

const router = express.Router();

router.get('/:uid', getProductById);

router.get('/trend', getProductsTrend);

router.get('/best-sellers', getProductsByBestSeller);

router.get('/:search', getProductsBySearch);

router.use(checkAdmin);

router.post('/add-product', addProduct);

router.patch('/modify-product', modifyProduct);

router.delete('/delete-product', deleteProduct);

export default router;