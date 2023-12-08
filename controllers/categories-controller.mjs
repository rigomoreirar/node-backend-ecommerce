import Category from '../models/category.mjs';
import CRUD from '../utils/CRUD.mjs';
import HttpError from '../models/http-error.mjs';
import mongoose from 'mongoose';

const getAllCategories = async (req, res, next) => {
    try {
      const categories = await Category.find(); // Fetch all products without any filters
      res.json({ categories: categories.map(category => category.toObject({ getters: true })) });
    } catch (error) {
      return next(new HttpError('Fetching products failed, please try again later.', 500));
    }
  };

const addCategory = async (req, res, next) => {
    const categoryData = req.body; // Add validation as necessary
    try {
      const newCategory = await CRUD.create(Category, categoryData);
      res.status(201).json({ category: newCategory });
    } catch (error) {
      return next(error);
    }
  };

  const getProductsByCategoryId = async (req, res, next) => {
    const categoryId = req.params.categoryId; 
  
    try {
      const categoryWithProducts = await CRUD.read(Category, categoryId, 'products');
  
      if (!categoryWithProducts) {
        return next(new HttpError('Category not found.', 404));
      }
      console.log(categoryWithProducts.products);
      res.json({ products: categoryWithProducts.products });
    } catch (error) {
      return next(new HttpError('Fetching products failed, please try again later.' + error.message, 500));
    }
  };

  const getCategoryById = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    try {
        const category = await CRUD.read(Category, categoryId);

        if (!category) {
            return next(new HttpError('Category not found.', 404));
        }

        res.json({ category: category.toObject({ getters: true }) });
    } catch (error) {
        return next(new HttpError('Fetching category failed, please try again later.', 500));
    }
};


  export { getAllCategories, addCategory, getProductsByCategoryId, getCategoryById };

  
