const Inscription = require("../model/Inscription");
const User = require("../model/User");
const Voyage = require("../model/Voyage");
const { deCoderToken } = require("../config/jwt");

/**
 * @description Inscrire un utilisateur à un voyage
 * @route POST /inscription
 */
module.exports.createInscription = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify token and get user ID
        const decoded = deCoderToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { voyageId, nombrePersonnes } = req.body;
        const utilisateurId = decoded.id;

        // Find the voyage
        const voyage = await Voyage.findById(voyageId);
        if (!voyage) {
            return res.status(404).json({ message: "Voyage not found." });
        }

        // Check if there are enough available places
        if (nombrePersonnes > voyage.placesDisponible) {
            return res.status(400).json({ 
                message: `Not enough places available. Only ${voyage.placesDisponible} left.` 
            });
        }

        // Calculate total price
        const totalPrix = voyage.prix * nombrePersonnes;

        // Create new inscription
        const newInscription = new Inscription({
            utilisateur: utilisateurId,
            voyage: voyageId,
            nombrePersonnes,
            totalPrix,
            statut: 'En attente' // Add default status
        });

        // Save inscription
        await newInscription.save();

        // Reduce available places
        voyage.placesDisponible -= nombrePersonnes;
        await voyage.save();

        res.status(201).json({ 
            message: "Inscription created successfully", 
            inscription: newInscription 
        });
    } catch (error) {
        console.error('Inscription error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @description Récupérer toutes les inscriptions
 * @route GET /inscription
 */
module.exports.getAllInscriptions = async (req, res) => {
    try {
        const inscriptions = await Inscription.find()
            .populate("utilisateur", "nom email")
            .populate("voyage", "titre prix image dateDeDepart dateDeRetour");

        res.status(200).json({ inscriptions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Récupérer une inscription par ID
 * @route GET /inscription/:id
 */
module.exports.getInscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const inscription = await Inscription.findById(id)
            .populate("utilisateur", "nom email")
            .populate("voyage", "titre prix");

        if (!inscription) {
            return res.status(404).json({ message: "Inscription non trouvée." });
        }

        res.status(200).json({ inscription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Modifier le statut d'une inscription
 * @route PUT /inscription/:id
 */
module.exports.updateInscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        if (!["En attente", "Accepté", "Refusé"].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide." });
        }

        // Get the current inscription to check its previous status
        const currentInscription = await Inscription.findById(id);
        if (!currentInscription) {
            return res.status(404).json({ message: "Inscription non trouvée." });
        }

        // If the booking is being rejected, restore the available places
        if (statut === "Refusé") {
            const voyage = await Voyage.findById(currentInscription.voyage);
            if (voyage) {
                voyage.placesDisponible += currentInscription.nombrePersonnes;
                await voyage.save();
            }
        }

        // Update the inscription status
        const updatedInscription = await Inscription.findByIdAndUpdate(
            id,
            { statut },
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            message: "Inscription mise à jour avec succès.", 
            inscription: updatedInscription 
        });
    } catch (error) {
        console.error('Error in updateInscription:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Supprimer une inscription
 * @route DELETE /inscription/:id
 */
module.exports.deleteInscription = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInscription = await Inscription.findByIdAndDelete(id);

        if (!deletedInscription) {
            return res.status(404).json({ message: "Inscription non trouvée." });
        }

        // Restore available places in the voyage
        const voyage = await Voyage.findById(deletedInscription.voyage);
        if (voyage) {
            voyage.placesDisponible += deletedInscription.nombrePersonnes;
            await voyage.save();
        }

        res.status(200).json({ message: "Inscription supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Get inscriptions for logged-in user
 * @route GET /inscription/user
 */
module.exports.getUserInscriptions = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Get user ID from token
        const decoded = deCoderToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const inscriptions = await Inscription.find({ utilisateur: decoded.id })
            .populate('voyage', 'destination prix photo dateDeDepart dateDeRetour');

        res.status(200).json({ inscriptions });
    } catch (error) {
        console.error('Error in getUserInscriptions:', error);
        res.status(500).json({ message: error.message });
    }
};
