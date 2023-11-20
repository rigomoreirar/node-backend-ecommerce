import uuid from 'uuid/v4.js';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error.mjs';

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Rigoberto',
        email: 'rigoberto@moreira.com',
        password: 'test123'
    }
]

const getUsers = (req, res, next) => {

    res.status(200)
    .json(DUMMY_USERS);

};

const signUp = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed', 422));
    }

    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find( user => user.email === email );

    if(hasUser) {
        return next(new HttpError('User Already exists!!', 422));
    };

    const createdUser = {
        id: uuid(),
        name,
        email,
        password
    };

    DUMMY_USERS.push(createdUser);

    res.status(201)
    .json({user: createdUser});

};

const login = (req, res, next) => {

    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find( user => user.email === email );

    if(!identifiedUser || identifiedUser.password !== password){
        return next(new HttpError('Credentials are worng', 401));
    } 

    res.status(200)
    .json({message: 'Logged in'});
};

export { getUsers };

export { signUp };

export { login };