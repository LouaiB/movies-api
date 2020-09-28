const User = require('../jwt/models/User');
const Post = require('../models/Post');
const Tag = require('../models/Tag');
const Movie = require('../models/Movie');
const Comment = require('../models/Comment');
const sortModes = require('../json/sort-modes.json');
const similarity = require('../utils/similarity');

const AddTag = {
    Success: 1,
}

const GetTags = {
    Success: 1,
}

const RemoveTag = {
    NotFound: 1,
    Success: 2,
}

const AddMovie = {
    Success: 1,
}

const RemoveMovie = {
    NotFound: 1,
    Success: 2,
}

const GetMovies = {
    Success: 1,
}

const GetRandom = {
    Success: 1,
}

const GetTrending = {
    Success: 1,
}

const GetMovie = {
    NotFound: 1,
    Success: 2,
}

const SearchMovies = {
    Success: 1,
}

// SILENT FAILURES //
const AddLike = {
    Success: 1,
}
const AddDislike = {
    Success: 1,
}
const RemoveLike = {
    Success: 1,
}
const RemoveDislike = {
    Success: 1,
}
////////////////////

const GetTweetResponseEnum = {
    UserNotFound: 1,
    PostNotFound: 2,
    Success: 3,
}

module.exports = {

    AddTag,
    RemoveTag,
    GetTags,
    AddMovie,
    RemoveMovie,
    GetMovies,
    GetRandom,
    GetTrending,
    GetMovie,
    SearchMovies,
    GetTweetResponseEnum,
    AddLike,
    AddDislike,
    RemoveLike,
    RemoveDislike,

    async addTag(name, description, thumbnail) {
        try{
            const newTag = new Tag({
                name,
                description,
                thumbnail,
            });
            newTag.save();
            return { status: AddTag.Success, tag: newTag };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async removeTag(tagId) {
        try{
            const tag = await Tag.findById(tagId);
            if(!tag) return { status: RemoveTag.NotFound };

            tag.remove();

            return { status: RemoveTag.Success };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async getTags() {
        try{
            const tags = await Tag.find({});
            return { status: GetTags.Success, tags };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async addMovie(title, description, tags, releaseDate, alternativeTitles, thumbnail, movieVideo) {
        try{
            const tagsList = tags.split('|').map(t => t.trim());
            const dbTags = [];
            for(let tag of tagsList){
                const dbTag = await Tag.findOne({name: tag});
                if(dbTag) dbTags.push(dbTag.name);
            }

            // !!! FOR PRESENTATION ONLY !!! //
            const views = (Math.random() * 10000).toFixed(0);
            const likesAmount = (Math.random() * views).toFixed(0);
            const dislikesAmount = (Math.random() * views).toFixed(0);
            const likes = [];
            const dislikes = [];
            for(let i = 1; i <= likesAmount; i++) likes.push(i);
            for(let i = 1; i <= dislikesAmount; i++) dislikes.push(i);
            /////////////////////////////////////

            const newMovie = new Movie({
                title,
                description,
                mediapath: movieVideo,
                thumbnail,
                tags: dbTags,
                views,      // PRESENTATION ONLY
                likes,      // PRESENTATION ONLY
                dislikes,   // PRESENTATION ONLY
            });
            if(releaseDate) newMovie.releasedOn = releaseDate;
            if(alternativeTitles) newMovie.alternativeTitles = alternativeTitles.split('|').map(altT => altT.trim());
            newMovie.save();
            return { status: AddMovie.Success, movie: newMovie };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async removeMovie(movieId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: RemoveMovie.NotFound };

            movie.remove();

            return { status: RemoveMovie.Success };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async getMovies() {
        try{
            const movies = await Movie.find({});
            return { status: GetMovies.Success, movies };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async getRandom(amount) {
        try{
            const amountInt = parseInt(amount);
            const movies = await Movie.aggregate([{ $sample: { size: amountInt } }]);
            return { status: GetMovies.Success, movies };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async getMovie(movieId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: GetMovie.NotFound };

            const tags = [];
            for (let t of movie.tags){
                const dbTag = await Tag.findOne({name: t});
                if(dbTag) tags.push(dbTag);
            }
            
            movie.views += 1;
            movie.save();

            // Fetch recomendations
            let recomendations = await Movie.aggregate([{ $sample: { size: 20 } }]);
            recomendations = recomendations.filter(rec => rec._id != movieId);
            
            return { status: GetMovie.Success, movie, tags, recomendations };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async searchMovies({ 
            query = '', 
            sortMode = sortModes[0], 
            includedTags = [], 
            excludedTags = [], 
            strictInclusion = true }, 
            pageNum, 
            pageSize
        ) {
        try{
            console.log('SEARCH');
            const applyQuery = !!query;
            const applyExclusion = excludedTags.length > 0;
            const applyInclusion = includedTags.length > 0;
            const applyPagination = pageSize && pageSize > 0;

            const movies = await Movie.find({});

            // Query
            console.log(`Query applied: ${applyQuery} (${query})`);
            let queried = movies;
            if(applyQuery) queried = movies.filter(m => similarity(m.title, query) > 0.3);

            // Tag exclusion
            console.log(`Exclusion applied: ${applyExclusion}`);
            let excluded = queried;
            if(applyExclusion) excluded = queried.filter(m => !m.tags.some(t => excludedTags.includes(t)));
            
            // Tag inclusion
            console.log(`Inclusion applied: ${applyInclusion}`);
            let included = excluded;
            if(applyInclusion) included = excluded.filter(m => strictInclusion
                ? includedTags.every(t => m.tags.includes(t))
                : includedTags.some(t => m.tags.includes(t)));

            // Sort
            console.log('SORTING');
            let sorted = included;
            switch(sortMode.code){
                case 1:
                    sorted.sort((a, b) => b.createdOn - a.createdOn);
                    break;
                case 2:
                    sorted.sort((a, b) => a.createdOn - b.createdOn);
                    break;
                case 3:
                    sorted.sort((a, b) => b.views - a.views);
                    break;
                case 4:
                    sorted.sort((a, b) => a.views - b.views);
                    break;
                case 5:
                    sorted.sort((a, b) => b.likes.length - a.likes.length);
                    break;
                case 6:
                    sorted.sort((a, b) => a.likes.length - b.likes.length);
                    break;
                case 7:
                    sorted.sort((a, b) => b.releasedOn - a.releasedOn);
                    break;
                case 8:
                    sorted.sort((a, b) => a.releasedOn - b.releasedOn);
                    break;
                case 9:
                    sorted.sort((a, b) => a.title > b.title);
                    break;
                case 10:
                    sorted.sort((a, b) => a.title < b.title);
                    break;
            }
            console.log('SORTED');

            // Paginate
            let page = sorted;
            if(applyPagination) page = sorted.slice(pageNum * pageSize, pageNum * pageSize + pageSize);

            // Fetch tags
            for(let m of page){
                const tags = [];
                for (let t of m.tags){
                    const dbTag = await Tag.findOne({name: t});
                    if(dbTag) tags.push(dbTag);
                }
                m.tags = tags;
            }

            // Total pages [if pagination]
            let pagesCount;
            if(applyPagination) pagesCount = (sorted.length/pageSize).toFixed(0) + 1;

            // Build result
            let result = {
                status: SearchMovies.Success, 
                movies: page
            }
            if(applyPagination) result.pages = pagesCount;

            return result;
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async getTrending(span, pageNum, pageSize) {
        try{
            const spanInt = parseInt(span);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - spanInt);
            console.log("MIN DATE");
            console.log(minDate);
            const movies = await Movie.find({createdOn: { $gte: minDate }});

            // Sort
            movies.sort((a, b) => b.views - a.views);
                    
            // Paginate
            let page = movies.slice(pageNum * pageSize, pageNum * pageSize + pageSize);

            // Total pages
            let pagesCount = (movies.length/pageSize).toFixed(0) + 1;

            // Build result
            let result = {
                status: GetTrending.Success, 
                movies: page
            }
            result.pages = pagesCount;

            return result;
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    
    async addLike(movieId, userId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: AddLike.Success };

            if(!movie.likes.includes(userId)) {
                movie.likes.push(userId);
                movie.dislikes = movie.dislikes.filter(d => d != userId);
                movie.save();
            }

            return { status: AddLike.Success, movie };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async addDislike(movieId, userId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: AddDislike.Success };

            if(!movie.dislikes.includes(userId)) {
                movie.dislikes.push(userId);
                movie.likes = movie.likes.filter(l => l != userId);
                movie.save();
            }

            return { status: AddDislike.Success, movie };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async removeLike(movieId, userId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: RemoveLike.Success };

            if(movie.likes.includes(userId)) {
                movie.likes = movie.likes.filter(l => l != userId);
                movie.save();
            }

            return { status: RemoveLike.Success, movie };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    async removeDislike(movieId, userId) {
        try{
            const movie = await Movie.findById(movieId);
            if(!movie) return { status: RemoveDislike.Success };

            if(movie.dislikes.includes(userId)) {
                movie.dislikes = movie.dislikes.filter(d => d != userId);
                movie.save();
            }

            return { status: RemoveDislike.Success, movie };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    
}