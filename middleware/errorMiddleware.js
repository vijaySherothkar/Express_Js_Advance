const errorHandler = (err, req, res, next) => {
    // Extract the status code from the response object or set it to 500 (Internal Server Error)
    const statusCode = res.statusCode || 500;

    // Extract the error message from the error object
    const errorMessage = err.message || 'Internal Server Error';

    // Log the error for debugging (optional)
    console.error(err);

    // Respond with an error JSON object
    res.status(statusCode).json({ error: errorMessage, stack: err?.stack });
};

module.exports = {
    errorHandler
}