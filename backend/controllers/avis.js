const Avis = require("../model/Avis");
const Voyage = require("../model/Voyage");
const Association = require("../model/Association");
const Inscription = require("../model/Inscription");

/**
 * @description Get all reviews for a specific voyage
 * @route GET /avis/voyage/:voyageId
 */
module.exports.getVoyageAvis = async (req, res) => {
    try {
        const avis = await Avis.find({ voyage: req.params.voyageId })
            .populate('utilisateur', 'nom')
            .populate('voyage', 'destination');
        res.json({ avis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Get all reviews for an association
 * @route GET /avis/association
 */
module.exports.getAssociationAvis = async (req, res) => {
    try {
        // Check if user is an association
        if (req.user.role !== 'association') {
            return res.status(403).json({ message: 'Only associations can access their reviews' });
        }

        // Get the association ID from the authenticated user
        const association = await Association.findOne({ userId: req.user.id });
        if (!association) {
            return res.status(404).json({ message: 'Association not found' });
        }

        // Get all voyages for this association
        const voyages = await Voyage.find({ associationId: association._id });
        if (!voyages.length) {
            return res.json({ avis: [] });
        }

        const voyageIds = voyages.map(voyage => voyage._id);

        // Get all reviews for these voyages
        const avis = await Avis.find({ voyage: { $in: voyageIds } })
            .populate('utilisateur', 'nom')
            .populate({
                path: 'voyage',
                select: 'destination associationId',
                populate: {
                    path: 'associationId',
                    select: 'nom'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ avis });
    } catch (error) {
        console.error('Error in getAssociationAvis:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @description Create a new review
 * @route POST /avis
 */
module.exports.createAvis = async (req, res) => {
    try {
        const { voyage: voyageId, note, commentaire } = req.body;
        const userId = req.user.id;

        // Check if voyage exists
        const voyageExist = await Voyage.findById(voyageId);
        if (!voyageExist) {
            return res.status(404).json({ message: "Voyage not found." });
        }

        // Check if user has an accepted booking
        const hasBooking = await Inscription.findOne({
            voyage: voyageId,
            utilisateur: userId,
            statut: 'Accepté'
        });

        if (!hasBooking) {
            return res.status(403).json({ 
                message: "You need to have an accepted booking to leave a review." 
            });
        }

        // Check if user has already reviewed
        const existingReview = await Avis.findOne({
            voyage: voyageId,
            utilisateur: userId
        });

        if (existingReview) {
            return res.status(400).json({ 
                message: "You have already reviewed this tour." 
            });
        }

        // Create new review
        const newAvis = new Avis({
            voyage: voyageId,
            utilisateur: userId,
            note,
            commentaire
        });

        await newAvis.save();
        res.status(201).json({ message: "Review added successfully.", avis: newAvis });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

/**
 * @description Delete a review
 * @route DELETE /avis/:id
 */
module.exports.deleteAvis = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the review
        const avis = await Avis.findById(id);
        if (!avis) {
            return res.status(404).json({ message: "Review not found." });
        }

        // Get the voyage and check if the user owns the association
        const voyage = await Voyage.findById(avis.voyage);
        if (!voyage) {
            return res.status(404).json({ message: "Voyage not found." });
        }

        const association = await Association.findOne({ 
            _id: voyage.associationId,
            userId: req.user.id 
        });

        if (!association) {
            return res.status(403).json({ message: "You are not authorized to delete this review." });
        }

        await avis.deleteOne();
        res.json({ message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

/**
 * @description Récupérer tous les avis d'un voyage
 * @route GET /avis/voyage/:voyageId
 */
module.exports.getAvisByVoyage = async (req, res) => {
    try {
        const { voyageId } = req.params;
        const avisList = await Avis.find({ voyage: voyageId })
            .populate("utilisateur", "nom email");

        res.status(200).json({ avis: avisList });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

/**
 * @description Modifier un avis
 * @route PUT /avis/:id
 */
module.exports.updateAvis = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, commentaire } = req.body;

        // Mettre à jour l'avis
        const updatedAvis = await Avis.findByIdAndUpdate(
            id,
            { note, commentaire },
            { new: true, runValidators: true }
        );

        if (!updatedAvis) {
            return res.status(404).json({ message: "Avis non trouvé." });
        }

        res.status(200).json({ message: "Avis mis à jour avec succès.", avis: updatedAvis });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};
