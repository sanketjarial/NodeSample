import mongoose from 'mongoose';
var Schema = mongoose.Schema({
  name: { type: String, unique: true },
  unit_price: Number,   // Can use mongoose-double if want to save value in float.
  description: String,
});
export default mongoose.model('Products', Schema);