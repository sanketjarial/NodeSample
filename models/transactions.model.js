import mongoose from 'mongoose';
var Schema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products'},
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    quantity: Number,
    total_price: Number
});
export default mongoose.model('Transactions', Schema);