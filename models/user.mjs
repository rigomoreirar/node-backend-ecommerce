import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true }
});

userSchema.plugin(mongooseUniqueValidator);

export default model('User', userSchema);