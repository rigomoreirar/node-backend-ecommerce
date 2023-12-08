import Payment from '../models/payments.mjs';
import User from '../models/user.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';

const getUserPayments = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const user = await CRUD.read(User, userId, 'paymentmethods');
    if (!user || user.paymentmethods.length === 0) {
      throw new HttpError('No payment methods found for this user.', 404);
    }
    res.json({ paymentMethods: user.paymentmethods.toObject({ getters: true }) });
  } catch (error) {
    return next(error);
  }
};

const addUserPayments = async (req, res, next) => {
  const userId = req.params.uid;
  const paymentData = req.body; // Validate and sanitize this data

  try {
    const newPayment = await CRUD.create(Payment, { ...paymentData, creator: userId }, [{ model: User, id: userId, field: 'paymentmethods' }]);
    res.status(201).json({ paymentMethod: newPayment });
  } catch (error) {
    return next(error);
  }
};

const deleteUserPayments = async (req, res, next) => {
  const userId = req.params.uid;
  const paymentId = req.params.paymentId; // Validate and sanitize this data

  try {
    const user = await CRUD.read(User, userId);
    if (!user || !user.paymentmethods.includes(paymentId)) {
      throw new HttpError('Payment method not found for this user.', 404);
    }

    await CRUD.delete(Payment, paymentId, [{ model: User, id: userId, field: 'paymentmethods' }]);
    res.status(200).json({ message: 'Payment method deleted.' });
  } catch (error) {
    return next(error);
  }
};

export { getUserPayments, addUserPayments, deleteUserPayments };
