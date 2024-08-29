const express = require('express');
const app = express();
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const { default: rateLimit } = require('express-rate-limit');
const { default: helmet } = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require('xss-clean');
const cors = require("cors")
// Setting up config.env file variables
const dotenv = require('dotenv');
dotenv.config()

const connectDatabase = require('./config/db');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');


// Handling Uncaught Exception
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
    process.exit(1);
});

// Connecting to databse
connectDatabase();


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200
}));

// Importing all routes
const jobs = require('./routes/jobs');
const auth = require("./routes/auth");
const user = require('./routes/user');

app.use('/api/v1', jobs);
app.use('/api/v1', auth);
app.use('/api/v1', user);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, ()=> {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled promise rejection.')
    server.close( () => {
        process.exit(1);
    }) 
});