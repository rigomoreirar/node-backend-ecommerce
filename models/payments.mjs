import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const paymentSchema = new Schema({
  nameoncard: { type: String, required: true },
  cardnumber: { type: String, required: true, maxlenght: 16 }, // This needs to be hashed
  expirationdate: { type: String, required: true },
  cvv: { type: String, required: true }, // This needs to be hashed
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

export default model('Payment', paymentSchema);
