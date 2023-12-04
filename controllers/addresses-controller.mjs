import Address from '../models/addresses.mjs';
import User from '../models/user.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';

const getUserAddresses = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const user = await CRUD.read(User, userId, 'adresses');
    if (!user || user.adresses.length === 0) {
      throw new HttpError('No addresses found for this user.', 404);
    }
    res.json({ addresses: user.adresses });
  } catch (error) {
    return next(error);
  }
};

const addUserAddresses = async (req, res, next) => {
  const userId = req.params.uid;
  const addressData = req.body; // Validate and sanitize this data

  try {
    const newAddress = await CRUD.create(Address, { ...addressData, creator: userId }, [{ model: User, id: userId, field: 'adresses' }]);
    res.status(201).json({ address: newAddress });
  } catch (error) {
    return next(error);
  }
};

const deleteUserAddresses = async (req, res, next) => {
  const userId = req.params.uid;
  const addressId = req.body.addressId; // Validate and sanitize this data

  try {
    const user = await CRUD.read(User, userId);
    if (!user || !user.adresses.includes(addressId)) {
      throw new HttpError('Address not found for this user.', 404);
    }

    await CRUD.delete(Address, addressId, [{ model: User, id: userId, field: 'adresses' }]);
    res.status(200).json({ message: 'Address deleted.' });
  } catch (error) {
    return next(error);
  }
};

export { getUserAddresses, addUserAddresses, deleteUserAddresses };
