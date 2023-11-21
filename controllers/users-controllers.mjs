import uuid from 'uuid/v4.js';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error.mjs';
import User from '../models/user.mjs';

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

const signUp = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    let createdUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'User not found.', 500
        );
        return next(error);
    }

    createdUser = new User({
        name,
        email,
        image: 'I am an image',
        password,
        places
    });

    if(existingUser) {
        const error = HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    } else {

        try {
            await createdUser.save();
        } catch (err) {
            const error = new HttpError(
                'Signing up failed, please try later.', 500
            );
            return next(error);
        }
    }

    res.status(201)
    .json({user: createdUser.toObject({ getters: true })});

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