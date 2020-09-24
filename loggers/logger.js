const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(format.timestamp(), format.json()),
            maxsize: 5000000, // 5MB
            maxFiles: 5,
            handleExceptions: true,
        }),
        new transports.Console({
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: 'logs/exceptions.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
            maxsize: 5000000, // 5MB
            maxFiles: 5,
        })
    ],
    rejectionHandlers: [
        new transports.File({
            filename: 'logs/rejections.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
            maxsize: 5000000, // 5MB
            maxFiles: 5,
        })
    ]
});

module.exports = logger;