import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import Cart from '../models/carts.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';

const ObjectId = mongoose.Types.ObjectId;

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
    // Create a new cart first
    const newCart = await CRUD.create(Cart, { products: [], creator: null });

    // Create a new user with the new cart's ObjectId
    const createdUser = await CRUD.create(User, {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: 'user',
      adresses: [],
      paymentmethods: [],
      cart: newCart._id, // Use the newly created cart ID
      orders: [],
      products: []
    });

    // Update the cart's creator field with the user's ObjectId
    await CRUD.update(Cart, newCart._id, { creator: createdUser._id });

    let token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      userId: createdUser.id, 
      email: createdUser.email, 
      token: token, 
      firstname: createdUser.firstname,
      cartId: newCart._id  
    });
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

    res.json({ 
      userId: existingUser.id, 
      email: existingUser.email, 
      token: token, 
      firstname: existingUser.firstname,
      cartId: existingUser.cart   });
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
  const { firstname, lastname, email } = req.body; // Extract the fields you want to update

  try {
    // Use findByIdAndUpdate with the option { new: true } to return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { firstname, lastname, email }, 
      { new: true }
    );

    if (!updatedUser) {
      throw new HttpError('User not found.', 404);
    }

    res.status(200).json({ user: updatedUser.toObject({ getters: true }) }); // Convert to object with getters
  } catch (error) {
    return next(new HttpError('Updating user information failed, please try again later.', 500));
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
 

  const userId = req.params.uid;
  if (req.userData && req.userData.role === 'admin') {
    res.status(200).json({ admin: 'true' });
  } else {
    return next(new HttpError('Not authorized as admin', 403));
  }
};

const getUserInfo = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    res.json({ 
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        image: user.image
      } 
    });
  } catch (err) {
    return next(new HttpError('Fetching user failed, please try again later.', 500));
  }
};

export { signup, login, updateUserInfo, deleteUser, checkIfAdmin, getUserInfo };

