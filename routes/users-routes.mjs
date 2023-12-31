import express from 'express';
import bodyParser from 'body-parser';
import { check } from'express-validator';

import { signup, login, updateUserInfo, deleteUser, checkIfAdmin, getUserInfo } from '../controllers/users-controller.mjs';
import fileUpload from '../middleware/file-upload.mjs';
import checkAuth from '../middleware/check-auth.mjs';

const router = express.Router();

router.post('/signup', 
    fileUpload.single('image'),
    [
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ]
    ,signup);

router.post('/login', login);

router.post('/role/:uid', checkIfAdmin);

router.use(checkAuth);

router.patch('/update-user-info/:uid', updateUserInfo);

router.delete('/delete-user/:uid', deleteUser);

router.get('/:uid', getUserInfo);

export default router;