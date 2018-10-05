var async = require("async");
import parallel from 'async/parallel';

//import models
import Users from '../models/users.model';
import Products from '../models/products.model';
import Transactions from '../models/transactions.model';

/* 
 @params transaction object. 
 @saves transaction data and update/create product and user. 
*/
export const saveTransaction = (req, res) => {
    const data  = req.body;
    let product = data.transaction.product;
    let userArr = { 
        name: data.name, 
        phone: data.phone, 
        address: data.address 
    };
    let prodArr = { 
        name: product.name, 
        unit_price: product.unit_price, 
        description: product.description 
    };
    
    async.parallel({
        /* Insert/Update user */
        userInfo: function(callback){
            Users.findOneAndUpdate(
                { phone: data.phone },
                userArr,
                { upsert: true, new: true },
                (err, data) => {
                    callback(err, data);
                }
            );
        },
        /* Insert/Update Product */
        productInfo: function(callback){
            Products.findOneAndUpdate(
                { name: product.name },
                prodArr,
                { upsert: true, new: true },
                (err, data) => {
                    callback(err, data);
                }
            );
        }
    },
    function(err, result){
        if(!err) {
            /* Insert a new transaction with product_id and user_id getting from the result. */ 
            Transactions.create(
                { 
                    product_id: result.productInfo._id,
                    user_id: result.userInfo._id,
                    quantity: product.quantity,
                    total_price: product.quantity * product.unit_price 
                },
                (err, data) => {
                    if (err) {
                        res.json({ 'status': 0, 'message': err });
                    } else {
                        res.json({ 'status': 1, 'message': 'Record added successfully' });
                    }
                }
            );
        } else {
            res.json({ 'status': 0, 'message': err });
        }
    });
    
}

/*
 @returns User data with the transactional details.
*/
export const getUsers = (req, res) => {
    Users.aggregate([
        {
            $lookup: {      /* Outer left Join with the transaction collections. */                                       
                from: "transactions",
                localField : "_id",
                foreignField: "user_id",
                as: "latest_transaction_detail"
            } 
        },
        { $unwind: "$latest_transaction_detail" },    /* Creates the new rows by merging the data. */
        { $sort: { "latest_transaction_detail.date": -1 } }, /* sort the data according to the latest date. */
        { 
            $group: {  /* Grouping the data accroding to the user phone no. */
                _id: "$phone",
                name: { $first: "$name"}, 
                phone: { $first: "$phone"}, 
                address: { $first: "$address"}, 
                total_transaction: { 
                    $sum: 1 
                }, 
                latest_transaction_detail: { $first: "$latest_transaction_detail"}, 
            } 
        },
        {
            $project: { /* Selectes the field required fro the response.*/
                _id: 0,
                name: 1,
                phone: 1,
                address: 1,
                total_transaction:1,
                "latest_transaction_detail.product_id": 1,
                "latest_transaction_detail.quantity": 1,
                "latest_transaction_detail.total_price": 1,

            }
        }
    ]).exec((err, data) => {
        if(!err) {
            res.json({ 'status': 1, 'data': data });
        } else {
            res.json({ 'status': 0, 'message': err });
        }
    });
} 
