import Product from '../models/products.mjs';
import Order from '../models/orders.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';
import mongoose from 'mongoose';

const getProductById = async (req, res, next) => {
  const productId = req.params.uid;
  try {
    const product = await CRUD.read(Product, productId);
    res.json({ product });
  } catch (error) {
    return next(error);
  }
};

const getProductsTrend = async (req, res, next) => {
  try {
    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);

    const trendingProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: aWeekAgo } } },
      { $unwind: "$products" },
      { $group: { _id: "$products.product", orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { $limit: 15 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: "$productDetails" }
    ]);

    res.json({ products: trendingProducts.map(p => p.productDetails) });
  } catch (error) {
    return next(new HttpError('Fetching trending products failed, please try again later.', 500));
  }
};

const getProductsByBestSeller = async (req, res, next) => {
  try {
    const bestSellingProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.product", orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { $limit: 15 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: "$productDetails" }
    ]);

    res.json({ products: bestSellingProducts.map(p => p.productDetails) });
  } catch (error) {
    return next(new HttpError('Fetching best selling products failed, please try again later.', 500));
  }
};

const getProductsBySearch = async (req, res, next) => {
  const searchString = req.params.search;
  try {
    const products = await Product.find({ $text: { $search: searchString } });
    res.json({ products });
  } catch (error) {
    return next(new HttpError('Searching products failed, please try again later.', 500));
  }
};

const addProduct = async (req, res, next) => {
  const productData = req.body; // Add validation as necessary
  try {
    const newProduct = await CRUD.create(Product, productData);
    res.status(201).json({ product: newProduct });
  } catch (error) {
    return next(error);
  }
};

const modifyProduct = async (req, res, next) => {
  const productId = req.params.uid;
  const updateData = req.body; // Add validation as necessary
  try {
    const updatedProduct = await CRUD.update(Product, productId, updateData);
    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.uid;
  try {
    await CRUD.delete(Product, productId);
    res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    return next(error);
  }
};

export { getProductById, getProductsTrend, getProductsByBestSeller, getProductsBySearch, addProduct, modifyProduct, deleteProduct };
