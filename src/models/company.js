import mongoose from 'mongoose';

//creating a schema
//creating an object companySchema
const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    companyLogoUrl: {
        type: String,
        default: '',
    },


}, {timestamps: true});

const company = mongoose.model('company', companySchema);
export default company;