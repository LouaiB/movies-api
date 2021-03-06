const multer = require('multer');
const path = require('path');

module.exports = tweetUpload = multer({
    storage: multer.diskStorage({
        // Setting directory on disk to save uploaded files
        destination: function (req, file, cb) {
            cb(null, 'public/tweet-media')
        },
    
        // Setting name of file saved
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + '-' + req.userId + path.extname(file.originalname))
        }
    }),
    limits: {
        // Setting Image Size Limit to 5MBs
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            //Error 
            cb(new Error('Please upload JPG and PNG images only!'))
        }
        //Success 
        cb(undefined, true)
    }
})