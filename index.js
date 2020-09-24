const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const path = require('path');
const morgan = require('morgan');
const logger = require('./loggers/logger');
const trafficLogger = require('./loggers/trafficLogger');
const analyticsLogger = require('./loggers/analyticsLogger');

const app = express();

// Loggers
app.use(morgan('combined', { stream: trafficLogger.stream }));
app.use(morgan('short', { stream: analyticsLogger.stream }));

// MongoDB
mongoose.connect(config.mongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => {
        console.error(err);
        logger.error(err.message, err);
        process.exit(1);
    });

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Routes
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use(cors());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/movies', require('./routes/movies'));

// Global Error Handler
app.use((err, req, res, next) => {
    if(err){
        res.status(500).json({ message: err.message });
        const logMessage = { 
            message: err.message,
            stack: err.stack,
            requestHeaders: req.headers,
            requestBody: req.body,
            responseHeaders: res.headers,
            responseStatus: 500,
            responseBody: res.body
        };
        logger.error(err.message, logMessage);
    }
    next();
})
process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node.js docs)
})

// Listen
const PORT = process.env.PORT || 6000;
const HOST = process.env.HOST || null;
app.listen(PORT, HOST, console.log(`Server started on ${HOST}:${PORT}`));

