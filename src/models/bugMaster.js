import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
autoIncrement.initialize(mongoose.connection);

const bugMasterSchema = mongoose.Schema(
    {
        bugId: { type: Number, default: '' },
        companyId: {
            type: mongoose.Schema.ObjectId,
            ref: 'company'
        },
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        },
        filedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        assignedTo: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        bugChild: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'bugtransactions',
            },
        ],
        expectedCompletionDate: { type: Date, default: '' },
        bugStatus: { type: Number, default: 0 }
    },
    { timestamps: true }
);

bugMasterSchema.plugin(autoIncrement.plugin, {
model: "bugmaster", // collection or table name in which you want to apply auto increment
field: "bugId", // field of model which you want to auto increment
startAt: 1000, // start your auto increment value from 1
incrementBy: 1, // incremented by 1
});


const bug_master = mongoose.model('bugmaster', bugMasterSchema);
export default bug_master;