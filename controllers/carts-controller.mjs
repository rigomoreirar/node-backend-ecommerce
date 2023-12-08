import Cart from '../models/carts.mjs';
import Order from '../models/orders.mjs';
import User from '../models/user.mjs';
import Product from '../models/products.mjs';
import Address from '../models/addresses.mjs';  
import Payment from '../models/payments.mjs';  

import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';
import mongoose from 'mongoose';


const getUserCart = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const user = await CRUD.read(User, userId, 'cart');
    if (!user || !user.cart) {
      throw new HttpError('Cart not found for this user.', 404);
    }

    const cart = await CRUD.read(Cart, user.cart);
    if (!cart) {
      throw new HttpError('Cart not found.', 404);
    }

    let totalCost = 0;
    let estimatedDeliveryTime = 0;
    const productsWithDetails = [];

    for (const item of cart.products) {
      if (!item.product) {
        console.error(`Product ID is undefined for an item in the cart. Skipping this item.`);
        continue;
      }

      try {
        const product = await CRUD.read(Product, item.product);
        const amount = item.amount;
        const price = parseFloat(product.saleprice) !== 0 ? parseFloat(product.saleprice) : parseFloat(product.regularprice);
        const taxCostPerItem = price * (parseFloat(product.taxpercentage) / 100);
        const totalCostPerType = (price + taxCostPerItem) * amount + parseFloat(product.shipmentcost);

        productsWithDetails.push({
          _id: item._id, // Use the cart item's _id for the key in the frontend
          image: product.image,
          name: product.name,
          amount,
          price: price + taxCostPerItem
        });

        totalCost += totalCostPerType;
        estimatedDeliveryTime = Math.max(estimatedDeliveryTime, parseInt(product.edt));
      } catch (error) {
        console.error(`Error fetching product details for ID ${item.product}:`, error);
      }
    }

    const response = {
      categoryId: cart.creator,
      products: productsWithDetails,
      totalCost: totalCost.toFixed(2),
      estimatedDeliveryTime,
      cartId: cart._id
    };

    res.json(response);
  } catch (error) {
    return next(error);
  }
};




const addCartToUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await CRUD.read(User, userId);
    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    // Create a new cart and assign it to the user
    const newCart = await CRUD.create(Cart, { products: [], creator: userId });

    // Update the user's cart field with the new cart's ObjectId
    await CRUD.update(User, userId, { cart: newCart._id });

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
  const cartId = req.params.cid;
  const userId = req.params.uid; 
  const { addressId, paymentMethodId, edt } = req.body;

  try {
    // Fetch the cart
    const cart = await CRUD.read(Cart, cartId);
    if (!cart || cart.products.length === 0) {
      throw new HttpError('Cart not found or empty.', 404);
    }

    // Validate address and payment method
    const address = await CRUD.read(Address, addressId);
    const paymentMethod = await CRUD.read(Payment, paymentMethodId);
    if (!address || !paymentMethod) {
      throw new HttpError('Address or Payment Method not found.', 404);
    }

    // Create new order
    const newOrder = {
      status: 'Processed', 
      edt: edt, 
      products: cart.products,
      orderinformation: {
        creator: userId,
        payment: paymentMethodId,
        address: addressId
      }
    };
    const createdOrder = await CRUD.create(Order, newOrder);

    // Clear the cart
    await CRUD.update(Cart, cartId, { products: [] });

    res.status(201).json({ order: createdOrder.toObject({ getters: true }) });
  } catch (err) {
    console.error(err); // Log the error for debugging
    const error = new HttpError(
      'Processing order failed, please try again later.',
      500
    );
    return next(error);
  }
};



const addItemToCart = async (req, res, next) => {
  const userId = req.params.uid;
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).send({ message: "Product ID is missing." });
  }

  try {
    const user = await CRUD.read(User, userId);
    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    if (!user.cart) {
      throw new HttpError('User does not have a cart.', 400);
    }

    const cart = await CRUD.read(Cart, user.cart);
    const existingProductIndex = cart.products.findIndex(p => 
      p.product && p.product.toString() === productId // Ensure product ID is valid
    );

    if (existingProductIndex >= 0) {
      // Update quantity if product already exists
      cart.products[existingProductIndex].amount += parseInt(quantity, 10);
    } else {
      // Add new product to the cart
      cart.products.push({ product: productId, amount: parseInt(quantity, 10) });
    }

    const updatedCart = await CRUD.update(Cart, cart._id, { products: cart.products });
    res.status(201).json({ cart: updatedCart });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};



const removeItemFromCart = async (req, res, next) => {
  const cartId = req.params.cid;
  const itemId = req.params.itemId; // ID of the cart item to be removed

  try {
    const cart = await CRUD.read(Cart, cartId);
    if (!cart) {
      throw new HttpError('Cart not found.', 404);
    }

    // Remove the item from the cart
    const updatedProducts = cart.products.filter(item => item._id.toString() !== itemId);
    const updatedCart = await CRUD.update(Cart, cartId, { products: updatedProducts });

    res.status(200).json({ cart: updatedCart });
  } catch (error) {
    return next(error);
  }
};




export { getUserCart, addCartToUser, modifyUserCart, processOrder, removeItemFromCart, addItemToCart };


