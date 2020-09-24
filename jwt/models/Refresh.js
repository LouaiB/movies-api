const mongoose = require('mongoose');

const RefreshSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
});

const Refresh = mongoose.model('refresh', RefreshSchema);
module.exports = Refresh;