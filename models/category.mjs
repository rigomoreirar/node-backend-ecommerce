import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const paymentSchema = new Schema({
  name: { type: String, required: true },
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }]
});

export default model('Category', paymentSchema);
