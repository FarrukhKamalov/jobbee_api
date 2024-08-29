const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your Email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address.']
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'employeer'],
            message: "Please select correct role"
        },
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter password for your account'],
        minlength: [8, 'Your password must be at least 8 characters long'],
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

UserSchema.pre('save', async function (next) {

    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

UserSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
}

UserSchema.methods.getResetPasswordToken = function () {
    // Random token yaratish
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Tokenni shifrlash va schema'ga saqlash
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Tokenning amal qilish vaqtini o'rnatish (30 daqiqa)
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
}

UserSchema.virtual('jobsPublished', {
    ref: "Jobs",
    localField: '_id',
    foreignField: "User",
    justOne: false
})


module.exports = mongoose.model("User", UserSchema);