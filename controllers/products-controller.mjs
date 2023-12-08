import Product from '../models/products.mjs';
import Category from '../models/category.mjs';
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
      const orders = await Order.find();

      let productCountMap = {};
      orders.forEach(order => {
          order.products.forEach(({ product, amount }) => {
              productCountMap[product.toString()] = (productCountMap[product.toString()] || 0) + amount;
          });
      });

      let sortedTrendProducts = Object.entries(productCountMap)
                                       .sort((a, b) => b[1] - a[1])
                                       .slice(0, 15)
                                       .map(entry => entry[0]);

      const trendProducts = await Product.find({ '_id': { $in: sortedTrendProducts } });

      if (!trendProducts) {
          throw new HttpError('Trend products not found.', 404);
      }

      res.json({ products: trendProducts.map(product => ({ 
          ...product.toObject({ getters: true }), 
          id: product.id 
        })) 
      });
  } catch (err) {
      console.error(err);
      const error = new HttpError('Fetching trend products failed, please try again later.', 500);
      return next(error);
  }
};



const getProductsByOffer = async (req, res, next) => {
  try {
      const productsOnSale = await Product.find({ saleprice: { $gt: 0 } });

      // Calculate sale percentage and sort
      const productsWithOfferPercentage = productsOnSale.map(product => {
          const regularPrice = parseFloat(product.regularprice);
          const salePrice = parseFloat(product.saleprice);
          
          const offerPercentage = salePrice > 0
                                  ? (((regularPrice - salePrice) / regularPrice) * 100).toFixed(0)
                                  : '0';

          return {
              ...product.toObject({ getters: true }),
              id: product.id, // Ensure id is included
              offerPercentage
          };
      });

      productsWithOfferPercentage.sort((a, b) => parseFloat(b.offerPercentage) - parseFloat(a.offerPercentage));

      // Get top 15 products
      const topOffers = productsWithOfferPercentage.slice(0, 15);

      if (!topOffers) {
          throw new HttpError('Products with top offers not found.', 404);
      }

      res.json({ products: topOffers });
  } catch (err) {
      console.error(err);
      const error = new HttpError('Fetching products with top offers failed, please try again later.', 500);
      return next(error);
  }
};



const getProductsByBestSeller = async (req, res, next) => {
  try {
      const orders = await Order.find({ status: 'Processed' });

      let productCountMap = {};
      orders.forEach(order => {
          order.products.forEach(({ product, amount }) => {
              productCountMap[product.toString()] = (productCountMap[product.toString()] || 0) + amount;
          });
      });

      let sortedProducts = Object.entries(productCountMap)
                                 .sort((a, b) => b[1] - a[1])
                                 .slice(0, 15)
                                 .map(entry => entry[0]);

      const bestSellingProducts = await Product.find({ '_id': { $in: sortedProducts } });

      if (!bestSellingProducts) {
          throw new HttpError('Best selling products not found.', 404);
      }

      res.json({ products: bestSellingProducts.map(product => ({ 
          ...product.toObject({ getters: true }), 
          id: product.id 
        })) 
      });
  } catch (err) {
      console.error(err);
      const error = new HttpError('Fetching best selling products failed, please try again later.', 500);
      return next(error);
  }
};



const getProductsBySearch = async (req, res, next) => {
  const searchString = req.params.search;

  try {
    // Ensure searchString is not empty and handle basic sanitization
    if (!searchString.trim()) {
      return res.json({ products: [] });
    }

    // Use a regular expression to match products that start with the searchString
    // The '^' symbol in regex denotes the start of a string
    const regex = new RegExp('^' + searchString, 'i'); // 'i' for case-insensitive

    const products = await Product.find({ name: { $regex: regex } });

    // Check if any products were found
    if (!products || products.length === 0) {
      return res.json({ products: [] }); // Return an empty array if no products are found
    }

    res.json({ products });
  } catch (error) {
    return next(new HttpError('Searching products failed, please try again later.', 500));
  }
};



const addProduct = async (req, res, next) => {
  const productData = req.body; // Add validation as necessary

  // Ensure that the category ID is provided in the request
  if (!productData.category) {
    return next(new HttpError('Category ID is missing.', 400));
  }

  try {
    // Create the product and add it to the specified category
    const newProduct = await CRUD.create(Product, productData, [{ model: Category, id: productData.category, field: 'products' }]);
    res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error('Error during creation:', err.message);
    return next(new HttpError('Creating product failed, please try again.', 500));
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
  const productId = req.params.pid;
  try {
    await CRUD.delete(Product, productId);
    res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    return next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find(); // Fetch all products without any filters
    res.json({ products: products.map(product => product.toObject({ getters: true })) });
  } catch (error) {
    return next(new HttpError('Fetching products failed, please try again later.', 500));
  }
};


export { getProductsByOffer, getAllProducts, getProductById, getProductsTrend, getProductsByBestSeller, getProductsBySearch, addProduct, modifyProduct, deleteProduct };
