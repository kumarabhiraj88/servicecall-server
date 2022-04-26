import mongoose from 'mongoose';

//creating a schema
//creating an object companySchema
const productSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'company'
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    }


}, {timestamps: true});

const product = mongoose.model('product', productSchema);
export default product;