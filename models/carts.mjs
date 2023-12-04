import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartSchema = new Schema({
  products: [{
    product: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
    amount: { type: Number, required: true }
  }],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

export default model('Cart', cartSchema);
