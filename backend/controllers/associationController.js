const Association = require("../model/Association");
const Voyage = require("../model/Voyage");
const bcrypt = require('bcryptjs');

/**
 * @description Créer une nouvelle association
 * @route POST /association
 */
module.exports.createAssociation = async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Log the request body

    const { nom, description, photo, email, phone, userId } = req.body;

    // Vérifier que tous les champs sont remplis
    if (!nom || !description || !photo || !email || !phone || !userId) {
      console.log('Missing required fields:', { nom, description, photo, email, phone, userId });
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérifier si l'email ou le téléphone existe déjà
    const existingAssociation = await Association.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingAssociation) {
      console.log('Association already exists:', existingAssociation);
      return res.status(400).json({ message: "Email ou numéro de téléphone déjà utilisé." });
    }

    // Créer une nouvelle association
    const newAssociation = await Association.create({
      nom,
      description,
      photo,
      email,
      phone,
      userId
    });

    console.log('Association created successfully:', newAssociation);
    res.status(201).json({ message: "Association créée avec succès", association: newAssociation });
  } catch (error) {
    console.error('Error creating association:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Récupérer toutes les associations
 * @route GET /association
 */
module.exports.getAllAssociations = async (req, res) => {
  try {
    const associations = await Association.find().populate("voyages"); // Inclure les voyages liés
    res.status(200).json({ associations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Récupérer une association par son ID
 * @route GET /association/:id
 */
module.exports.getAssociationById = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await Association.findById(id).populate("voyages");

    if (!association) {
      return res.status(404).json({ message: "Association non trouvée." });
    }

    res.status(200).json({ association });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * @description Add a voyage to an association
 * @route POST /association/:id/voyages
 */
module.exports.addVoyageToAssociation = async (req, res) => {
    try {
        const { id } = req.params; // Association ID
        const voyageData = req.body; // Voyage data

        console.log('Adding voyage to association:', { id, voyageData }); // Debug log

        // Check if the association exists
        const association = await Association.findById(id);
        if (!association) {
            console.log('Association not found:', id); // Debug log
            return res.status(404).json({ message: "Association not found." });
        }

        // Create a new voyage with the correct field names
        const newVoyage = await Voyage.create({
            destination: voyageData.destination,
            prix: voyageData.prix,
            dateDeDepart: voyageData.dateDeDepart,
            dateDeRetour: voyageData.dateDeRetour,
            placesDisponible: voyageData.placesDisponible,
            photo: voyageData.photo,
            description: voyageData.description,
            associationId: id
        });

        console.log('New voyage created:', newVoyage); // Debug log

        // Add the voyage to the association's voyages array
        association.voyages.push(newVoyage._id);
        await association.save();

        console.log('Association updated with new voyage:', association); // Debug log

        // Return the populated association with the new voyage
        const updatedAssociation = await Association.findById(id).populate('voyages');

        res.status(201).json({
            message: "Voyage added successfully",
            voyage: newVoyage,
            association: updatedAssociation
        });
    } catch (error) {
        console.error('Error adding voyage:', error);
        res.status(500).json({ message: error.message });
    }
};
  
/**
 * @description Modifier une association
 * @route PUT /association/:id
 */
module.exports.updateAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, photo, email, phone } = req.body;

    const updatedAssociation = await Association.findByIdAndUpdate(
      id,
      { nom, description, photo, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedAssociation) {
      return res.status(404).json({ message: "Association non trouvée." });
    }

    res.status(200).json({ message: "Association mise à jour avec succès", association: updatedAssociation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * @description Remove a voyage from an association
 * @route DELETE /association/:id/voyages/:voyageId
 */
module.exports.removeVoyageFromAssociation = async (req, res) => {
    try {
        const { id, voyageId } = req.params;

        // Find the association
        const association = await Association.findById(id);
        if (!association) {
            return res.status(404).json({ message: "Association not found." });
        }

        // Remove the voyage from the list
        association.voyages = association.voyages.filter(v => v.toString() !== voyageId);
        await association.save();

        res.status(200).json({ message: "Voyage removed successfully.", association });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @description Update association status
 * @route PUT /association/:id/status
 */
module.exports.updateAssociationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'active' or 'inactive'" });
    }

    const updatedAssociation = await Association.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedAssociation) {
      return res.status(404).json({ message: "Association non trouvée." });
    }

    res.status(200).json({ 
      message: `Association status updated to ${status}`, 
      association: updatedAssociation 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get association by user ID
 * @route GET /association/user/:userId
 */
module.exports.getAssociationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching association for user:', userId); // Debug log

    // Find the association and populate the voyages
    const association = await Association.findOne({ userId })
      .populate({
        path: 'voyages',
        model: 'Voyage'
      });

    if (!association) {
      console.log('No association found for user:', userId); // Debug log
      return res.status(404).json({ message: "Association not found for this user." });
    }

    console.log('Found association with voyages:', association); // Debug log
    res.status(200).json({ association });
  } catch (error) {
    console.error("Error in getAssociationByUserId:", error);
    res.status(500).json({ 
      message: "Error fetching association",
      error: error.message 
    });
  }
};

/**
 * @description Update a voyage
 * @route PUT /association/:id/voyages/:voyageId
 */
module.exports.updateVoyage = async (req, res) => {
  try {
    const { id, voyageId } = req.params;
    const voyageData = req.body;

    // Check if the association exists
    const association = await Association.findById(id);
    if (!association) {
      return res.status(404).json({ message: "Association not found." });
    }

    // Check if the voyage exists and belongs to this association
    const voyage = await Voyage.findOne({ _id: voyageId, associationId: id });
    if (!voyage) {
      return res.status(404).json({ message: "Voyage not found." });
    }

    // Update the voyage
    const updatedVoyage = await Voyage.findByIdAndUpdate(
      voyageId,
      {
        destination: voyageData.destination,
        prix: voyageData.prix,
        date: voyageData.date,
        duree: voyageData.duree,
        description: voyageData.description
      },
      { new: true }
    );

    res.status(200).json({ 
      message: "Voyage updated successfully.", 
      voyage: updatedVoyage 
    });
  } catch (error) {
    console.error('Error updating voyage:', error);
    res.status(500).json({ message: error.message });
  }
};

