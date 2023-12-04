import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { getUserPayments, addUserPayments, deleteUserPayments } from '../controllers/payments-controller.mjs';
import checkAuth from '../middleware/check-auth.mjs';

const router = express.Router();

router.use(checkAuth);

router.get('/:uid', getUserPayments);

router.post('/:uid', addUserPayments);

router.delete('/:uid', deleteUserPayments);

export default router;