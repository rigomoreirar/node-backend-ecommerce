import express from 'express';
import bodyParser from 'body-parser';

import { getAllProducts, getProductById, getProductsTrend, getProductsByBestSeller, getProductsBySearch,
    addProduct, modifyProduct, deleteProduct, getProductsByOffer } from '../controllers/products-controller.mjs';
import checkAdmin from '../middleware/check-admin.mjs';

const router = express.Router();

router.get('/:uid', getProductById);

router.get('/trend/list', getProductsTrend);

router.get('/best-sellers/list', getProductsByBestSeller);

router.get('/offer/list', getProductsByOffer);

router.get('/search/:search', getProductsBySearch);

router.get('/', getAllProducts)

router.use(checkAdmin);

router.post('/add-product', addProduct);

router.patch('/modify-product', modifyProduct);

router.delete('/delete-product/:pid', deleteProduct);

export default router;