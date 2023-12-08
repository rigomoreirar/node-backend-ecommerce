import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  status: { type: String, required: true },
  edt: { type: String, required: true }, //estimated delivery time
  products: [{
    product: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
    amount: { type: Number, required: true }
  }],
  orderinformation: { creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
            payment: {type: mongoose.Types.ObjectId, required: true, ref: 'Payment'},
            address: {type: mongoose.Types.ObjectId, required: true, ref: 'Address'},
             }
});

export default model('Order', orderSchema);
