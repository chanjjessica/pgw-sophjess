const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: Date,
        required: true
    }
})

const Tournament = mongoose.model('Tournament', TournamentSchema);

module.exports = Tournament;