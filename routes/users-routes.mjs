import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { getUsers, signUp, login } from '../controllers/users-controllers.mjs';

const router = express.Router();

router.get('/', getUsers);

router.post('/signup', 
    [
        check('name')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ]
    ,signUp);

router.post('/login', login);

export default router;