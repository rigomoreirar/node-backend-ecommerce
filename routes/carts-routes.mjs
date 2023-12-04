import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { addCartToUser, modifyUserCart, getUserCart, processOrder } from '../controllers/carts-controller.mjs';
import checkAuth from '../middleware/check-auth.mjs';


const router = express.Router();

router.use(checkAuth);

router.get('/:uid', getUserCart);

router.post('/:uid', addCartToUser);

router.patch('/:cid', modifyUserCart);

router.post('/process-order/:cid', processOrder);

export default router;
