module.exports = {

    getTrendingValidator: (req, res, next) => {
        const { span, pageNum, pageSize } = req.body;
        const errors = [];

        if(!span) errors.push('span required.');
        try{
            parseInt(span);
        } catch {
            errors.push('span must be an int.');
        }

        if(pageNum == null || pageNum == undefined) errors.push('pageNum required.');
        try{
            parseInt(pageNum);
        } catch {
            errors.push('pageNum must be an int.');
        }

        if(!pageSize) errors.push('pageSize required.');
        try{
            parseInt(pageSize);
        } catch {
            errors.push('pageSize must be an int.');
        }
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },

    searchMoviesValidator: (req, res, next) => {
        const { filters, pageNum, pageSize } = req.body;
        const errors = [];

        if(pageNum == null || pageNum == undefined) errors.push('pageNum required.');
        try{
            parseInt(pageNum);
        } catch {
            errors.push('pageNum must be an int.');
        }

        if(!pageSize) errors.push('pageSize required.');
        try{
            parseInt(pageSize);
        } catch {
            errors.push('pageSize must be an int.');
        }
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },

    addLikeValidator: (req, res, next) => {
        const { movieId } = req.body;
        const errors = [];

        if(!movieId) errors.push('movieId required.');
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },
    addDislikeValidator: (req, res, next) => {
        const { movieId } = req.body;
        const errors = [];

        if(!movieId) errors.push('movieId required.');
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },
    removeLikeValidator: (req, res, next) => {
        const { movieId } = req.body;
        const errors = [];

        if(!movieId) errors.push('movieId required.');
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },
    removeDislikeValidator: (req, res, next) => {
        const { movieId } = req.body;
        const errors = [];

        if(!movieId) errors.push('movieId required.');
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            next();
        }
    },

}