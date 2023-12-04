import Order from '../models/orders.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';

const getCurrentOrders = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const currentOrders = await Order.find({ creator: userId, status: 'Processed' }).populate('products.product');
    if (currentOrders.length === 0) {
      throw new HttpError('No current orders found for this user.', 404);
    }
    res.json({ orders: currentOrders });
  } catch (error) {
    return next(error);
  }
};

const getUserOrdersHistory = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const orderHistory = await Order.find({ creator: userId, status: { $ne: 'Processed' } }).populate('products.product');
    if (orderHistory.length === 0) {
      throw new HttpError('No order history found for this user.', 404);
    }
    res.json({ orders: orderHistory });
  } catch (error) {
    return next(error);
  }
};

export { getCurrentOrders, getUserOrdersHistory };
