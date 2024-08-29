const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const validator = require("validator");

const geocoder = require("../utils/geocoder.js")

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter Job title."],
        trim: true,
        maxLength: [100, "Job title can not exceed 100 character"],
    },
    slug: String,
    description: {
        type: String,
        required: [true, "Please enter Job description"],
        maxLength: [3000, "Job description can not exceed 3000 character"],
    },
    email: {
        type: String,
        validate: [validator.isEmail, "Please add a valid email address"],
    },
    address: {
        type: String,
        required: [true, "Please add an address"],
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, "Please add Company name."],
    },
    industry: {
        type: [String],
        required: [true, 'Please enter industry for this job'],
        enum: {
            values: [
                "Business",
                "Information Technology",
                "Banking",
                "Education/Training",
                "Telecommunication",
                "Others",
            ],
            message: "Please select correct options for industry.",
        },
    },
    jobType: {
        type: String,
        required: [true, 'Please enter job type.'],
        enum: {
            values: [
                'Permanent', 
                'Temporary',
                'Intership'
            ],
            message: "Please select correct options for job type.",
        },
    },
    minEducation: {
        type: String,
        required: [true, 'Please enter minimum education for this job.'],
        enum: {
            values: ["Bachelors", "Masters", "Phd", 'No'],
            message: "Please select correct options for Education.",
        },
    },
    positions: {
        type: Number,
        default: 1,
    },
    experience: {
        type: String,
        required: [true, 'Please enter experience required for this job.'],
        enum: {
            values: [
                "No Experience",
                "1 Year - 2 Years",
                "2 Year - 5 Years",
                "5 Years+",
            ],
            message: "Please select correct options for Experince.",
        },
    },
    salary: {
        type: Number,
        required: [true, "Please enter expected salary for this job."],
    },
    postingDate: {
        type: Date,
        default: Date.now,
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7),
    },
    applicantsApplied: {
        type: [Object],
        select: false,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});










jobSchema.pre('save', function(next) {
    this.slug = slugify(this.title, {lower: true});
    next()
})


jobSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    
})
module.exports = mongoose.model("Jobs", jobSchema);
