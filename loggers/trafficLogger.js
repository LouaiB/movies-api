const { createLogger, transports, format } = require('winston');

const trafficLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'logs/traffic.log',
            format: format.combine(format.timestamp(), format.json()),
            maxsize: 50000000, // 50MB
            maxFiles: 5,
            handleExceptions: true,
        })
    ]
});

trafficLogger.stream = {
    write: function(message, encoding) {
        trafficLogger.info(message);
    },
};

module.exports = trafficLogger;