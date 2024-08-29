const userModel = require("../models/userModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const jobModel = require("../models/jobModel");
const fs = require('fs');
const APIFilters = require("../utils/apiFilters");

const getUseProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id)
        .populate({
            path: "jobsPublished",
            select: 'title postingDate'
        })

    res.status(200).json({
        success: true,
        data: user
    })
})

const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select('+password');

    const isMatched = await user.comparePassword(req.body.currentPassword);
    if (!isMatched) {
        return next(new ErrorHandler('OLD Password is incorrect.', 401));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, req, res);
})


const updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        data: user
    })
});


const getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await jobModel.find({ 'applicantsApplied.id': req.user.id }).select('+applicantsApplied')

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
})

const getPublishedJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await jobModel.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
})

const deleteUser = catchAsyncErrors(async (req, res, next) => {

    deleteUserData(req.user.id, req.user.role);
    const user = await userModel.findByIdAndDelete(req.user.id);

    res.cookie("token", "none", {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Your Account has Been deleted."
    })
})


const getUsers = catchAsyncErrors(async (req, res, next) => {
    const apiFilters = new APIFilters(userModel.find(), req.query)
        .filters()
        .sort()
        .limitFields()
        .pagination();
    const users = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: users.length,
        data: users
    })
})

const deleteUserAdmin = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
        return next(new ErrorHandler(`User not found : ${req.params.id}`, 404))
    }

    await deleteUserData(user.id, user.role);
    
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: 'User is deleted by Admin.'
    });
})


const deleteUserData = async (user, role) => {
    if (role === 'employeer') {
        await jobModel.deleteMany({ user: user });
    };

    if (role === "user") {
        const appliedJobs = await jobModel.find({ 'applicantsApplied.id': user }).select('+applicantApplied');

        for (let i = 0; i < appliedJobs.length; i++) {
            let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user);

            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', '');

            fs.unlink(filepath, err => {
                if (err) {
                    return console.log(err)
                }
            })

            appliedJobs[i].applicantsApplied.splice(appliedJobs[i]);

            applicantsApplied.indexOf(obj.id);

            appliedJobs[i].save();
        }
    }
}

module.exports = {
    getUseProfile,
    updatePassword,
    updateUser,
    deleteUser,
    getAppliedJobs,
    getPublishedJobs,
    getUsers,
    deleteUserAdmin
}