const User = require('../jwt/models/User');
const Post = require('../models/Post');

const TweetResponseEnum = {
    UserNotFound: 1,
    Success: 2
}

const GetTweetResponseEnum = {
    UserNotFound: 1,
    PostNotFound: 2,
    Success: 3,
}

module.exports = {

    TweetResponseEnum,
    GetTweetResponseEnum,

    async tweet(userId, tweet, mediapath) {
        try{
            const user = await User.findById(userId);
            if(!user) return { status: TweetResponseEnum.UserNotFound };

            const newTweet = new Post({
                userId: userId,
                content: tweet,
                mediapath: mediapath,
            });
            newTweet.save();
            return { status: TweetResponseEnum.Success, tweet: newTweet };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    
    async getTweet(tweetId){
        try{
            const tweet = await Post.findById(tweetId);
            if(!tweet) return { status: GetTweetResponseEnum.PostNotFound };

            const poster = await User.findById(tweet.userId);
            if(!poster) return { status: GetTweetResponseEnum.UserNotFound };

            return { status: GetTweetResponseEnum.Success, tweet, poster };
        } catch(e) {
            console.error(e.message);
            throw e;
        }
    },

    
}