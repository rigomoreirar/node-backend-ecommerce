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

const getUsers = async (req, res, next) => {

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.', 500
        );
        return next(error);
    }

    res.status(200)
    .json({users: users.map(user => user.toObject({ getters: true }))});

};

const signUp = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passeddd', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    let createdUser;
    try {
        existingUser = await User.findOne({ email: email });
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
        places: []
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

const login = async (req, res, next) => {

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'User not found.', 500
        );
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials.', 401
        );
        return next(error);
    }

    res.status(200)
    .json({message: 'Logged in'});
};

export { getUsers };

export { signUp };

export { login };