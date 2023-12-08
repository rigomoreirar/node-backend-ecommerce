import jwt from 'jsonwebtoken';
import HttpError from '../models/http-error.mjs';
import User from '../models/user.mjs'; 

export default async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    // This needs to be made into a secret
    const decodedToken = jwt.verify(token, `${process.env.JWT_CODE}`);
    req.userData = { userId: decodedToken.userId };

    // Find the user based on the userId from the token
    const user = await User.findById(req.userData.userId);
    if (!user) {
      throw new Error('Authentication failed!');
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      throw new Error('Not authorized as an admin!');
    }

    next();
  } catch (err) {
    const error = new HttpError('Not authorized!', 403);
    return next(error);
  }
};
