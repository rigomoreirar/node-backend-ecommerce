import mongoose from 'mongoose';
import HttpError from '../models/http-error.mjs';

const CRUD = {
  // Create operation
  create: async (Model, data, relations = []) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const item = new Model(data);
      await item.save({ session });

      for (const relation of relations) {
        const relatedItem = await relation.model.findById(relation.id);
        relatedItem[relation.field].push(item);
        await relatedItem.save({ session });
      }

      await session.commitTransaction();
      return item;
    } catch (err) {
      await session.abortTransaction();
      throw new HttpError('Creating item failed, please try again.' + err.message, 500);
    } finally {
      session.endSession();
    }
  },

  // Read operation
  read: async (Model, id, populateOptions = '') => {
    try {
      const item = await Model.findById(id).populate(populateOptions);
      if (!item) {
        throw new HttpError('Item not found.', 404);
      }
      return item;
    } catch (err) {
      console.error(err);  // Add this line to log the error
      throw new HttpError('Reading item failed, please try again later.', 500);
    }
  },
  

  // Update operation
  update: async (Model, id, updateData) => {
    try {
      const item = await Model.findByIdAndUpdate(id, updateData, { new: true });
      if (!item) {
        throw new HttpError('Item not found.', 404);
      }
      return item;
    } catch (err) {
      throw new HttpError('Updating item failed, please try again later.', 500);
    }
  },

  // Delete operation
  delete: async (Model, id, relations = []) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const item = await Model.findByIdAndRemove(id, { session });
      if (!item) {
        throw new HttpError('Item not found.', 404);
      }

      for (const relation of relations) {
        const relatedItem = await relation.model.findById(relation.id);
        relatedItem[relation.field].pull(item);
        await relatedItem.save({ session });
      }

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new HttpError('Deleting item failed, please try again later.'+err.message, 500);
    } finally {
      session.endSession();
    }
  }
};

export default CRUD;
