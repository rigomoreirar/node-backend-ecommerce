import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true },
  adresses: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Address' }],
  paymentmethods: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Payment' }],
  cart: { type: mongoose.Types.ObjectId, required: true, ref: 'Cart' },
  orders: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Order' }],
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }],
});

userSchema.plugin(mongooseUniqueValidator);

export default model('User', userSchema);