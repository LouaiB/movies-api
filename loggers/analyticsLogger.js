const { createLogger, transports, format } = require('winston');

const analyticsLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'logs/analytics.log',
            format: format.combine(format.timestamp(), format.json()),
            maxsize: 50000000, // 50MB
            maxFiles: 5,
            handleExceptions: true,
        })
    ]
});

analyticsLogger.stream = {
    write: function(message, encoding) {
        analyticsLogger.info(message);
    },
};

module.exports = analyticsLogger;