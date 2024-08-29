const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const userModel = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await userModel.create({
        name,
        email,
        password,
        role
    });

    sendToken(user, 200, req, res);
})



const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }


    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401))
    }

    sendToken(user, 200, req, res);
})


const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findOne({
        email: req.body.email
    });

    if (!user) {
        return next(new ErrorHandler('No user found with this email.', 404))
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave: false
    });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your Password reset link is as follow: \n\n${resetUrl}\n\n If you have not request this, then please ignore that.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'Jobee-api Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email send Successfully to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        console.log(error.stack)
        return next(new ErrorHandler('Email is not sent', 500))
    }
})


const resetPassword = catchAsyncErrors(async (req, res, next) => {
    try {
          const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await userModel.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendToken(user, 200, req, res);
    } catch (error) {
        console.log(error.stack)
        return next(new ErrorHandler('Email is not sent', 500))
    }
});


const logOut  = catchAsyncErrors(async(req,res,next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.log(error)
    }
})
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logOut
}

