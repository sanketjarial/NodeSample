import mongoose from 'mongoose';
var Schema = mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  address: String
});
export default mongoose.model('Users', Schema);