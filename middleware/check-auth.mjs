import jwt from 'jsonwebtoken';
import HttpError from '../models/http-error.mjs';

export default (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new HttpError('Authentication failed! No token provided.', 401);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_CODE);
    if (!decodedToken) {
      throw new HttpError('Authentication failed! Invalid token.', 403);
    }
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed! ' + err.message, 403);
    return next(error);
  }
};
