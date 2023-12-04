import Cart from '../models/carts.mjs';
import Order from '../models/orders.mjs';
import User from '../models/user.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';
import mongoose from 'mongoose';

const getUserCart = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const userCart = await CRUD.read(User, userId, 'cart');
    if (!userCart.cart || userCart.cart.length === 0) {
      throw new HttpError('No cart found for this user.', 404);
    }
    res.json({ cart: userCart.cart[0] }); // As per your requirement, only one cart per user
  } catch (error) {
    return next(error);
  }
};

const addCartToUser = async (req, res, next) => {
  const userId = req.params.uid;
  const cartData = req.body; // Validate and sanitize this data

  try {
    const user = await CRUD.read(User, userId);
    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    const newCart = await CRUD.create(Cart, cartData, [{ model: User, id: userId, field: 'cart' }]);
    res.status(201).json({ cart: newCart });
  } catch (error) {
    return next(error);
  }
};

const modifyUserCart = async (req, res, next) => {
  const cartId = req.params.cid;
  const updateData = req.body; // Validate and sanitize this data

  try {
    const updatedCart = await CRUD.update(Cart, cartId, updateData);
    res.status(200).json({ cart: updatedCart });
  } catch (error) {
    return next(error);
  }
};

const processOrder = async (req, res, next) => {
  const userId = req.body.userId; // Validate and sanitize this data
  try {
    const user = await CRUD.read(User, userId);
    if (!user || user.cart.length === 0) {
      throw new HttpError('Cart not found for this user.', 404);
    }

    const cart = await CRUD.read(Cart, user.cart[0]._id);
    const newOrder = await CRUD.create(Order, { ...cart.toObject(), status: 'Processed', creator: userId }, [{ model: User, id: userId, field: 'orders' }]);

    // Clear the cart after order is created
    await CRUD.delete(Cart, cart._id);

    res.status(201).json({ order: newOrder });
  } catch (error) {
    return next(error);
  }
};

export { getUserCart, addCartToUser, modifyUserCart, processOrder };
