const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
5001;
require('dotenv').config();
const morgan = require('morgan');
const connectDB = require("./config/db");
connectDB();
const { errorHandler } = require("./middleware/errorMiddleware");
// Use morgan middleware with the 'dev' format
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//User Routes
const users = require('./routes/userRoutes');
app.use('/api', users);
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/v2/api', uploadRoutes);
//entry response
app.get('', (req, res) => {
    res.send('Running!');
});
//Port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//put on last
app.use(errorHandler)