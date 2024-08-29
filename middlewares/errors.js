const ErrorHandler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success : false,
            error : err,
            errMessage : err.message,
            stack : err.stack
        });
    }

    if(process.env.NODE_ENV === 'production ') {
        let error = {...err};

        error.message = err.message;

        // Wrong Mongoose Object ID Error
       if(err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 404);
        }

        // Handling Mongoose Validation Error
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        // Handling Wrong JWT Token error
        if(err.name == "JsonWebTokenError") {
            const message = 'JSON Web Token is invalid. Try Again!';
            error = new ErrorHandler(message, 500);
        }

        //  Handling Expired JWT token error
        if(err.name == 'TokenExpiredError') {
            const message = 'Json Web Token is expired. Try Again!';
            error = new ErrorHandler(message, 500)
        }


        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`
            error = new ErrorHandler(message, 400);
        }
        res.status(error.statusCode).json({
            success : false,
            message : error.message || 'Internal Server Error.'
        })

    }

}