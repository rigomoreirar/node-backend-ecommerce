import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { getUsers, signup, login } from '../controllers/users-controllers.mjs';
import fileUpload from '../middleware/file-upload.mjs';

const router = express.Router();

router.get('/', getUsers);

router.post('/signup', 
    fileUpload.single('image'),
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
    ,signup);

router.post('/login', login);

export default router;