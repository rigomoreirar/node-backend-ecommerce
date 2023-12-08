import Order from '../models/orders.mjs';
import CRUD from '../utils/CRUD.mjs';
import User from '../models/user.mjs';
import HttpError from '../models/http-error.mjs';

const getCurrentOrders = async (req, res, next) => {
    const userId = req.params.uid;

    try {
        const currentOrders = await CRUD.read(Order, {
            'orderinformation.creator': userId,
            status: 'Processed'
        }, 'products.product orderinformation.payment orderinformation.address');

        if (!currentOrders || currentOrders.length === 0) {
            throw new HttpError('Current orders not found.', 404);
        }

        const modifiedOrders = currentOrders.map(order => {
            const modifiedOrder = order.toObject({ getters: true });
            if (modifiedOrder.orderinformation.payment) {
                modifiedOrder.orderinformation.payment.cardnumber = 
                    "**** **** **** " + modifiedOrder.orderinformation.payment.cardnumber.slice(-4);
            }
            return modifiedOrder;
        });

        res.json({ orders: modifiedOrders });
    } catch (err) {
        console.error(err);
        const error = new HttpError('Fetching current orders failed, please try again later.', 500);
        return next(error);
    }
};


const getUserOrdersHistory = async (req, res, next) => {
  const userId = req.params.uid;

  try {
      const orderHistory = await CRUD.read(Order, {
          'orderinformation.creator': userId,
          status: { $ne: 'Processed' }
      }, 'products.product orderinformation.payment orderinformation.address');

      if (!orderHistory || orderHistory.length === 0) {
          throw new HttpError('Order history not found.', 404);
      }

      const modifiedOrders = orderHistory.map(order => {
          const modifiedOrder = order.toObject({ getters: true });
          if (modifiedOrder.orderinformation.payment) {
              modifiedOrder.orderinformation.payment.cardnumber = 
                  "**** **** **** " + modifiedOrder.orderinformation.payment.cardnumber.slice(-4);
          }
          return modifiedOrder;
      });

      res.json({ orders: modifiedOrders });
  } catch (err) {
      console.error(err);
      const error = new HttpError('Fetching order history failed, please try again later.', 500);
      return next(error);
  }
};



export { getCurrentOrders, getUserOrdersHistory };
