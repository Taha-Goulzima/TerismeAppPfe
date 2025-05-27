const mongoose = require('mongoose');

const voyageSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: true,
        min: 0
    },
    dateDeDepart: {
        type: Date,
        required: true
    },
    dateDeRetour: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return this.dateDeDepart < value;
            },
            message: 'La date de retour doit être après la date de départ.'
        }
    },
    placesDisponible: {
        type: Number,
        required: true,
        min: 0
    },
    photo: {
        type: String,
        required: true
    },
    associationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Association',
        required: true
    },
    activities: [{
        type: String,
        required: true,
        enum: [
            'Beach Fun',
            'Cultural & Heritage',
            'Adventure & Nature',
            'Nightlife & Party',
            'Relaxation & Wellness',
            'Eco & Sustainable Tourism',
            'Food & Drink Experiences',
            'Winter & Snow Adventures',
            'Entertainment & Events',
            'Desert & Safari',
            'Art & Creativity',
            'Luxury Experiences',
            'Island & Cruise Experiences',
            'Sports & Fitness',
            'Exclusive Tours',
            'Family-Friendly'
        ]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Voyage', voyageSchema);
