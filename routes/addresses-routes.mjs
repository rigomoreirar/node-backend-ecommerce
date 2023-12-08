import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { getUserAddresses, addUserAddresses, deleteUserAddresses } from '../controllers/addresses-controller.mjs';
import checkAuth from '../middleware/check-auth.mjs';

const router = express.Router();

router.use(checkAuth);

router.get('/:uid', getUserAddresses);

router.post('/:uid', addUserAddresses);

router.delete('/:uid/:addressId', deleteUserAddresses);

export default router;