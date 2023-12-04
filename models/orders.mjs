import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  status: { type: String, required: true },
  edt: { type: String, required: true }, //estimated delivery time
  products: [{
    product: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
    amount: { type: Number, required: true }
  }],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

export default model('Order', orderSchema);
