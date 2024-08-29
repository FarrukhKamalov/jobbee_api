const jobModel = require("../models/jobModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const geocoder = require("../utils/geocoder");
const APIFilters = require("../utils/apiFilters");
const path = require('path');


const getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(jobModel.find(), req.query)
    .filters()
    .sort()
    .limitFields()
    .searchByQuerqy()
    .pagination();

  const jobs = await apiFilters.query;

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

const getJob = catchAsyncErrors(async (req, res, next) => {
  const job = await jobModel.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

const newJob = catchAsyncErrors(async (req, res, next) => {

  req.body.user = req.user.id;

  const job = await jobModel.create(req.body);

  res.status(200).json({
    success: true,
    message: "Bu router yangi ish orni yaratadi",
    data: job,
  });
});

const updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await jobModel.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  if(job.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorHandler(`User(${req.user.id})  is  not allowed to update this job`))
  }

  job = await jobModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Job is updated.",
    data: job,
  });
});

const deleteJob = catchAsyncErrors(async (req, res, next) => {
  let job = await jobModel.findById(req.params.id).select('+applicantsApplied');

  if (!job) {
    return next(new ErrorHandler("Job Not found.", 404));
  }

  if(job.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorHandler(`User(${req.user.id})  is  not allowed to delete this job`))
  }


  for(let i=0; i< job.applicantsApplied.length; i++){
    let filepath = `${__dirname}/public/uploads/${job.applicantsApplied[i].resume}`.replace('\\controllers', '');
    fs.unlink(filepath, err =>{
      if(err) return console.log(err);
    })
  }


  job = await jobModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Job is deleted.`,
  });
});

const getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);

  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3963;

  const jobs = await jobModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

const jobStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await jobModel.aggregate([
    {
      $match: {
        $text: {
          $search: '"' + req.params.topic + '"',
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: {
          $avg: "$salary",
        },
        minSalary: {
          $min: "$salary",
        },
        maxSalary: {
          $max: "$salary",
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No Stats found for - ${req.params.topic}`, 200)
    );
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});


const applyJob = catchAsyncErrors(async (req, res, next) => {
  let job = await jobModel.findById(req.params.id).select("+applicantsApplied");

  if (!job) {
    return next(new ErrorHandler('Job not found.', 404));
  }

  if (new Date(job.lastDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
    return next(new ErrorHandler('You can not apply to this job. Date is over.', 400));
  }

  for(let i=0; i < job.applicantsApplied.length; i++){ 
      if(job.applicantsApplied[i].id.toString() === req.user.id.toString()){
        return next(new ErrorHandler('You have already applied for this job.', 400));
      }
  }

  if (!req.files.file) {
    return next(new ErrorHandler('Please upload file.', 400))
  }

  const file = req.files.file;

  const supportedFiles = /.docs|.pdf/;
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler("Please upload document file.", 400))
  }

  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorHandler('Please upload file less than 2MB.', 400));
  }

  file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorHandler("Resume upload failed.", 500));
    }

    await jobModel.findByIdAndUpdate(req.params.id, {
      $push: {
        applicantsApplied: {
          id: req.user._id,
          resume: file.name
        }
      }
    }, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    }
    )
  });
  
  res.status(200).json({
    success: true,
    message: 'Applied to Job successfully.',
    data: file.name
  })
});

module.exports = {
  getJobs,
  getJobsInRadius,
  newJob,
  updateJob,
  deleteJob,
  getJob,
  jobStats,
  applyJob
};
