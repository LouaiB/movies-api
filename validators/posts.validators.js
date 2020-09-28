module.exports = {

    addTweetValidator: (req, res, next) => {
        const { tweet } = req.body;
        const errors = [];

        if(!tweet){
            errors.push('tweet required.');
        }
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },

}