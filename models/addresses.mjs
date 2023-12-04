import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const addressSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

export default model('Address', addressSchema);
