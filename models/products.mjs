import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  regularprice: { type: String, required: true,}, 
  saleprice: { type: String, required: true },
  shipmentcost: { type: String, required: true },
  taxpercentage: { type: String, required: true },
  stock: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  shortdescription: { type: String, required: true },
  edt: { type: String, required: true }, // estimated delivery time
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  orders: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Order' }]
});

export default model('Product', productSchema);
