import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';

const JWT_SECRET = `${process.env.JWT_CODE}`; // Should be an environment variable

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { firstname, lastname, email, password } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again.', 500));
  }

  try {
    const createdUser = await CRUD.create(User, {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      image: req.file.path, 
      role: 'user',
      adresses: [],
      paymentmethods: [],
      cart: [],
      orders: [],
      products: []
    });

    let token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      throw new HttpError('Invalid credentials, could not log you in.', 403);
    }

    let isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      throw new HttpError('Invalid credentials, could not log you in.', 403);
    }

    let token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
  } catch (err) {
    return next(new HttpError('Logging in failed, please try again later.', 500));
  }
};

const updateUserInfo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const userId = req.params.uid;
  const updateData = req.body; // Make sure to validate and sanitize this data

  try {
    const updatedUser = await CRUD.update(User, userId, updateData);
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    await CRUD.delete(User, userId);
    res.status(200).json({ message: 'User deleted.' });
  } catch (error) {
    return next(error);
  }
};

const checkIfAdmin = (req, res, next) => {
  // Implementation depends on how you store and verify admin roles
  // Example:
  if (req.userData && req.userData.role === 'admin') {
    next();
  } else {
    return next(new HttpError('Not authorized as admin', 403));
  }
};

export { signup, login, updateUserInfo, deleteUser, checkIfAdmin };
