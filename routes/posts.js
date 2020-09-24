/**
 * AN EXAMPLE CONTROLLER TO ILLUSTRATE THE DESIGN
 * UTILIZES THE REPOSITORY FILE "posts.repo.js"
 */

const express = require('express');
const router = express.Router();
const PostsRepo = require('../repositories/posts.repo');
const { ensureAuthenticated, ensureHasRoles } = require('../jwt/auth.middleware');
const multer = require('multer');
const tweetUpload = require('../utils/multer/tweetUpload.multer');
const { addTweetValidator } = require('../validators/posts.validators');

// SHOULD USE A VALIDATOR HERE
router.post('/addTweetWithAttachment', ensureAuthenticated, async (req, res, next) => {
    try{
        tweetUpload.single("attachment")(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
              return res.status(400).json({ message: err.message });
            } else if (err) {
              // An unknown error occurred when uploading.
              return res.status(500).json({ message: err.message });
            }
        
            // Everything went fine.
            let { tweet } = req.body;
            const file = req.file;
            let filepath = file ? 'tweet-media/' + file.filename : null;
            let errors = [];
        
            // TODO: Validation
            if(!tweet){
                //errors.push('tweet required.');
                tweet = 'asfasjklhfajkfhaffsjkalf';
            }
        
            if(errors.length > 0){
                return res.status(400).json({ message: 'One or more validation errors occured.', errors });
            } else {
                const result = await PostsRepo.tweet(req.user._id, tweet, filepath);
                switch(result.status){
                    case PostsRepo.TweetResponseEnum.UserNotFound:
                        return res.status(404).json({ ...result, message: 'User not found.'});
                        break;
                    case PostsRepo.TweetResponseEnum.Success:
                        return res.json({ ...result, message: 'Tweeted successfully.'});
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

router.post('/addTweet', ensureAuthenticated, addTweetValidator, async (req, res, next) => {
    try{
        const { tweet } = req.body;
        
        const result = await PostsRepo.tweet(req.user._id, tweet, null);
        switch(result.status){
            case PostsRepo.TweetResponseEnum.UserNotFound:
                return res.status(404).json({ ...result, message: 'User not found.'});
                break;
            case PostsRepo.TweetResponseEnum.Success:
                return res.json({ ...result, message: 'Tweeted successfully.'});
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
