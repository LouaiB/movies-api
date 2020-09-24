/**
 * AN EXAMPLE CONTROLLER TO ILLUSTRATE THE DESIGN
 * UTILIZES THE REPOSITORY FILE "posts.repo.js"
 */

const express = require('express');
const router = express.Router();
const PostsRepo = require('../repositories/posts.repo');
const MoviesRepo = require('../repositories/movies.repo');
const { ensureAuthenticated, ensureHasRoles } = require('../jwt/auth.middleware');
const multer = require('multer');
const tweetUpload = require('../utils/multer/tweetUpload.multer');
const tagUpload = require('../utils/multer/tagUpload.multer');
const movieUpload = require('../utils/multer/movieUpload.multer');
const { addTweetValidator } = require('../validators/posts.validators');

// TAGS
router.post('/addTag', ensureAuthenticated, async (req, res, next) => {
    try{
        tagUpload.single("thumbnail")(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
              return res.status(400).json({ message: err.message });
            } else if (err) {
              // An unknown error occurred when uploading.
              return res.status(500).json({ message: err.message });
            }
        
            // Everything went fine.
            let { name, description } = req.body;
            const file = req.file;
            let filepath = file ? 'tag-thumbnails/' + file.filename : null;
            let errors = [];
        
            // TODO: Validation
            if(!name) errors.push('tag name required');
            if(!description) errors.push('tag description required');
        
            if(errors.length > 0){
                return res.status(400).json({ message: 'One or more validation errors occured.', errors });
            } else {
                const result = await MoviesRepo.addTag(name, description, filepath);
                switch(result.status){
                    case MoviesRepo.AddTag.Success:
                        return res.json({ ...result, message: 'Added tag successfully.'});
                        break;
                    default:
                        return res.json({ message: 'Default response.'});
                }
            }
        })

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.delete('/deleteTag/:id', async (req, res, next) => {
    try{

        const { id } = req.params;

        const result = await MoviesRepo.removeTag(id);
        switch(result.status){
            case MoviesRepo.RemoveTag.NotFound:
                return res.status(404).json({ ...result, message: 'Tag not found.'});
                break;
            case MoviesRepo.RemoveTag.Success:
                return res.json({ ...result, message: 'Deleted tag successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.get('/getTags', async (req, res, next) => {
    try{
        const result = await MoviesRepo.getTags();
        switch(result.status){
            case MoviesRepo.GetTags.Success:
                return res.json({ ...result, message: 'Fetched tags successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

// Movies
router.post('/addMovie', ensureAuthenticated, async (req, res, next) => {
    try{
        movieUpload.fields(
            [{
                name: 'thumbnail', maxCount: 1
            }, {
                name: 'movieVideo', maxCount: 1
            }]
        )(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
              return res.status(400).json({ message: err.message });
            } else if (err) {
              // An unknown error occurred when uploading.
              return res.status(500).json({ message: err.message });
            }
        
            // Everything went fine.
            let { title, description, tags, releaseDate, alternativeTitles } = req.body;
            const files = req.files;
            const thumbnail = files['thumbnail'][0];
            const movieVideo = files['movieVideo'][0];
            console.log(thumbnail.filename);
            console.log(movieVideo.filename);
            let thumbnailFilepath = thumbnail ? 'movies/' + thumbnail.filename : null;
            let movieVideoFilepath = movieVideo ? 'movies/' + movieVideo.filename : null;
            let errors = [];
        
            // TODO: Validation
            if(!title) errors.push('movie title required');
            if(!description) errors.push('movie description required');
            if(!tags) errors.push('movie tags required');
        
            if(errors.length > 0){
                return res.status(400).json({ message: 'One or more validation errors occured.', errors });
            } else {
                const result = await MoviesRepo.addMovie(title, description, tags, releaseDate, alternativeTitles, thumbnailFilepath, movieVideoFilepath);
                switch(result.status){
                    case MoviesRepo.AddMovie.Success:
                        return res.json({ ...result, message: 'Added movie successfully.'});
                        break;
                    default:
                        return res.json({ message: 'Default response.'});
                }
            }
        })

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.delete('/deleteMovie/:id', async (req, res, next) => {
    try{

        const { id } = req.params;

        const result = await MoviesRepo.removeMovie(id);
        switch(result.status){
            case MoviesRepo.RemoveMovie.NotFound:
                return res.status(404).json({ ...result, message: 'Movie not found.'});
                break;
            case MoviesRepo.RemoveMovie.Success:
                return res.json({ ...result, message: 'Deleted movie successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.get('/getMovies', async (req, res, next) => {
    try{
        const result = await MoviesRepo.getMovies();
        switch(result.status){
            case MoviesRepo.GetMovies.Success:
                return res.json({ ...result, message: 'Fetched movies successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.get('/getRandom/:amount', async (req, res, next) => {
    try{
        const { amount } = req.params;

        const result = await MoviesRepo.getRandom(amount);
        switch(result.status){
            case MoviesRepo.GetRandom.Success:
                return res.json({ ...result, message: 'Fetched random movies successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

// TODO: Add validator
router.post('/getTrending', async (req, res, next) => {
    try{
        const { span, pageNum, pageSize } = req.body;

        const result = await MoviesRepo.getTrending(span, pageNum, pageSize);
        switch(result.status){
            case MoviesRepo.GetTrending.Success:
                return res.json({ ...result, message: 'Fetched trending movies successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.get('/getMovie/:id', async (req, res, next) => {
    try{
        const { id } = req.params;

        const result = await MoviesRepo.getMovie(id);
        switch(result.status){
            case MoviesRepo.GetMovie.NotFound:
                return res.status(404).json({ ...result, message: 'Movie not found.'});
                break;
            case MoviesRepo.GetMovie.Success:
                return res.json({ ...result, message: 'Fetched movie successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.post('/searchMovies', async (req, res, next) => {
    try{
        const { filters, pageNum, pageSize } = req.body;

        const result = await MoviesRepo.searchMovies(filters, pageNum, pageSize);
        switch(result.status){
            case MoviesRepo.SearchMovies.Success:
                return res.json({ ...result, message: 'Searched movies successfully.'});
                break;
            default:
                return res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.get('/getTweet/:id', ensureAuthenticated, async (req, res, next) => {
    try{
        const tweetId = req.params.id;
    
        const result = await PostsRepo.getTweet(tweetId);
        switch(result.status){
            case PostsRepo.GetTweetResponseEnum.UserNotFound:
                res.status(404).json({ ...result, message: 'Poster not found.'});
                break;
            case PostsRepo.GetTweetResponseEnum.PostNotFound:
                res.status(404).json({ ...result, message: 'Tweet not found.'});
                break;
            case PostsRepo.GetTweetResponseEnum.Success:
                res.json(result);
                break;
            default:
                res.json({ message: 'Default response.'});
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
