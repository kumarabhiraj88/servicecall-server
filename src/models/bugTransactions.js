import mongoose from 'mongoose';

//creating a schema
//creating an object bugTransactionsSchema
const bugTransactionsSchema = mongoose.Schema(
    {
        masterId: {
            type: mongoose.Schema.ObjectId,
            ref: 'bugmaster'
        },
        bugDescription: { type: String, default: '' },
        bugAttachmentsUrl: {
                type: String,
                default: '',
            },
        updatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        changedStatus: { type: Number, default: '' }
    },
    { timestamps: true }
);

const bug_transaction = mongoose.model('bugtransactions', bugTransactionsSchema);
export default bug_transaction;