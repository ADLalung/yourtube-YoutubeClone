import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    email: { type:String, required:true, unique:true, lowercase:true },
    name: { type:String },
    channelname: { type:String },
    subscriptionTier: { 
        type:String,
        enum: ['Free', 'Bronze', 'Silver', 'Gold'],
        default: 'Free'
    },
    lastQuotaResetDate: {
        type: Date,
        default: Date.now
    },
    description: { type:String },
    image: { type:String },
    joinedon: { type:Date, default:Date.now }
},{ timestamps: true })

export default mongoose.model("user", userSchema)