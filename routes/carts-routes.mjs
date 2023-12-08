import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { addCartToUser, modifyUserCart, getUserCart, 
    processOrder, addItemToCart, removeItemFromCart } from '../controllers/carts-controller.mjs';
import checkAuth from '../middleware/check-auth.mjs';


const router = express.Router();

router.use(checkAuth);

router.get('/:uid', getUserCart);

router.post('/:uid', addCartToUser);

router.post('/:uid/item', addItemToCart);

router.delete('/:cid/item/:itemId', removeItemFromCart);

router.post('/process-order/:cid/:uid', processOrder);

router.patch('/:cid', modifyUserCart);


export default router;
