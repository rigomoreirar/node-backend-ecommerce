import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { getCurrentOrders, getUserOrdersHistory } from '../controllers/orders-controller.mjs';
import checkAuth from '../middleware/check-auth.mjs';

const router = express.Router();

router.use(checkAuth);

router.get('/:uid', getCurrentOrders);

router.get('/:uid', getUserOrdersHistory);

export default router;