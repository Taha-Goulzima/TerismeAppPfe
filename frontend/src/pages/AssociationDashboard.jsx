import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AssociationDashboard = () => {
    const [voyages, setVoyages] = useState([]);
    const [association, setAssociation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddVoyageModalOpen, setIsAddVoyageModalOpen] = useState(false);
    const [isEditVoyageModalOpen, setIsEditVoyageModalOpen] = useState(false);
    const [selectedVoyage, setSelectedVoyage] = useState(null);
    const [inscriptions, setInscriptions] = useState([]);
    const [showInscriptions, setShowInscriptions] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAssociationData = async () => {
            try {
                console.log('Fetching association data for user:', user._id); // Debug log

                // First, find the association linked to this user
                const associationResponse = await api.get(`/association/user/${user._id}`);

                console.log('Association response:', associationResponse.data); // Debug log

                if (associationResponse.data.association) {
                    const associationData = associationResponse.data.association;
                    console.log('Setting association data:', associationData); // Debug log
                    setAssociation(associationData);
                    
                    // Ensure voyages is an array
                    const voyagesArray = Array.isArray(associationData.voyages) 
                        ? associationData.voyages 
                        : [];
                    console.log('Setting voyages:', voyagesArray); // Debug log
                    setVoyages(voyagesArray);

                    // Fetch inscriptions for this association's voyages
                    const inscriptionsResponse = await api.get('/inscription');

                    // Filter inscriptions for this association's voyages
                    const associationInscriptions = inscriptionsResponse.data.inscriptions.filter(
                        inscription => voyagesArray.some(voyage => voyage._id === inscription.voyage._id)
                    );
                    setInscriptions(associationInscriptions);
                } else {
                    console.log('No association found in response'); // Debug log
                    toast.error('No association found for this user');
                }
            } catch (error) {
                console.error('Error fetching association data:', error);
                console.error('Error response:', error.response?.data); // Debug log
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    toast.error(error.response.data.message || 'Error fetching association data');
                } else if (error.request) {
                    // The request was made but no response was received
                    toast.error('No response from server. Please check your connection.');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    toast.error('Error setting up the request');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchAssociationData();
        }
    }, [user?._id]);

    const handleAddVoyage = async (voyageData) => {
        try {
            const response = await api.post(
                `/association/${association._id}/voyages`,
                voyageData
            );
            console.log('Response from adding voyage:', response.data);
            
            if (response.data && response.data.voyage && response.data.association) {
                // Update both the voyages and association states
                setVoyages(response.data.association.voyages);
                setAssociation(response.data.association);
                toast.success('Voyage added successfully');
                setIsAddVoyageModalOpen(false);
            } else {
                toast.error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error adding voyage:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Error adding voyage');
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('Error setting up the request');
            }
        }
    };

    const handleEditVoyage = async (voyageData) => {
        try {
            const response = await api.put(
                `/association/${association._id}/voyages/${selectedVoyage._id}`,
                voyageData
            );
            console.log('Response from editing voyage:', response.data);
            
            // Update the local state with the updated voyage
            setVoyages(voyages.map(voyage => 
                voyage._id === selectedVoyage._id 
                    ? { ...voyage, ...response.data.voyage }
                    : voyage
            ));
            
            toast.success('Voyage updated successfully');
            setIsEditVoyageModalOpen(false);
            setSelectedVoyage(null);
        } catch (error) {
            console.error('Error editing voyage:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Error editing voyage');
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('Error setting up the request');
            }
        }
    };

    const handleDeleteVoyage = async (voyageId) => {
        if (!window.confirm('Are you sure you want to delete this voyage?')) return;

        try {
            await api.delete(
                `/association/${association._id}/voyages/${voyageId}`,
            );
            toast.success('Voyage deleted successfully');
            setVoyages(voyages.filter(v => v._id !== voyageId));
        } catch (error) {
            console.error('Error deleting voyage:', error);
            toast.error(error.response?.data?.message || 'Error deleting voyage');
        }
    };

    const handleUpdateInscriptionStatus = async (inscriptionId, newStatus) => {
        try {
            await api.put(
                `/inscription/${inscriptionId}`,
                { statut: newStatus }
            );
            toast.success(`Inscription ${newStatus.toLowerCase()} successfully`);
            
            // Update local state
            setInscriptions(inscriptions.map(inscription => 
                inscription._id === inscriptionId 
                    ? { ...inscription, statut: newStatus }
                    : inscription
            ));
        } catch (error) {
            console.error('Error updating inscription:', error);
            toast.error(error.response?.data?.message || 'Error updating inscription');
        }
    };

    const handleDeleteInscription = async (inscriptionId) => {
        if (!window.confirm('Are you sure you want to delete this inscription?')) return;

        try {
            await api.delete(
                `/inscription/${inscriptionId}`
            );
            toast.success('Inscription deleted successfully');
            
            // Update local state
            setInscriptions(inscriptions.filter(inscription => inscription._id !== inscriptionId));
        } catch (error) {
            console.error('Error deleting inscription:', error);
            toast.error(error.response?.data?.message || 'Error deleting inscription');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!association) {
        return <div className="text-center p-4">No association found</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Association Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAddVoyageModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Add Voyage
                    </button>
                    <button
                        onClick={() => setShowInscriptions(!showInscriptions)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        {showInscriptions ? 'Hide Inscriptions' : 'Show Inscriptions'}
                    </button>
                    <Link
                        to="/association/reviews"
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        Manage Reviews
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Total Voyages</h2>
                    <p className="text-4xl font-bold text-blue-600">{voyages.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Association Details</h2>
                    <p className="text-gray-600">Name: {association.nom}</p>
                    <p className="text-gray-600">Email: {association.email}</p>
                    <p className="text-gray-600">Phone: {association.phone}</p>
                    <p className="text-gray-600">Description: {association.description}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Your Voyages</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Places</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {voyages.map((voyage) => (
                                <tr key={voyage._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img 
                                            src={voyage.photo} 
                                            alt={voyage.destination}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{voyage.destination}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{voyage.prix} DH</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(voyage.dateDeDepart).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(voyage.dateDeRetour).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{voyage.placesDisponible}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {association.status === 'active' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVoyage(voyage);
                                                        setIsEditVoyageModalOpen(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVoyage(voyage._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showInscriptions && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Tour Inscriptions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voyage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of People</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inscriptions.map((inscription) => (
                                    <tr key={inscription._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{inscription.utilisateur.nom}</div>
                                            <div className="text-sm text-gray-500">{inscription.utilisateur.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{inscription.voyage.destination}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(inscription.voyage.dateDeDepart).toLocaleDateString()} - 
                                                {new Date(inscription.voyage.dateDeRetour).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {inscription.nombrePersonnes}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {inscription.totalPrix} DH
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                inscription.statut === 'Accepté' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : inscription.statut === 'Refusé'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {inscription.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {inscription.statut === 'En attente' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateInscriptionStatus(inscription._id, 'Accepté')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateInscriptionStatus(inscription._id, 'Refusé')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDeleteInscription(inscription._id)}
                                                className="text-gray-600 hover:text-gray-900 ml-2"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Voyage Modal */}
            {isAddVoyageModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-8 border w-[600px] shadow-2xl rounded-2xl bg-white transform transition-all">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setIsAddVoyageModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Add New Voyage</h3>
                                <p className="mt-2 text-sm text-gray-500">Create a new travel package for your association</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleAddVoyage({
                                    destination: formData.get('destination'),
                                    prix: formData.get('prix'),
                                    dateDeDepart: formData.get('dateDeDepart'),
                                    dateDeRetour: formData.get('dateDeRetour'),
                                    placesDisponible: formData.get('placesDisponible'),
                                    photo: formData.get('photo'),
                                    description: formData.get('description')
                                });
                            }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                        <input
                                            type="text"
                                            name="destination"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Enter destination"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                        <input
                                            type="number"
                                            name="prix"
                                            required
                                            min="0"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Enter price"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                                        <input
                                            type="date"
                                            name="dateDeDepart"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                        <input
                                            type="date"
                                            name="dateDeRetour"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Places</label>
                                    <input
                                        type="number"
                                        name="placesDisponible"
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter number of available places"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                                    <input
                                        type="url"
                                        name="photo"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter photo URL (e.g., https://example.com/photo.jpg)"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Enter a valid URL for the voyage photo
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter voyage description"
                                    />
                                </div>

                                <div className="flex justify-end gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddVoyageModalOpen(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        Add Voyage
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Voyage Modal */}
            {isEditVoyageModalOpen && selectedVoyage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-8 border w-[600px] shadow-2xl rounded-2xl bg-white transform transition-all">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => {
                                    setIsEditVoyageModalOpen(false);
                                    setSelectedVoyage(null);
                                }}
                                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Edit Voyage</h3>
                                <p className="mt-2 text-sm text-gray-500">Update your travel package details</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleEditVoyage({
                                    destination: formData.get('destination'),
                                    prix: formData.get('prix'),
                                    dateDeDepart: formData.get('dateDeDepart'),
                                    dateDeRetour: formData.get('dateDeRetour'),
                                    placesDisponible: formData.get('placesDisponible'),
                                    photo: formData.get('photo'),
                                    description: formData.get('description')
                                });
                            }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                        <input
                                            type="text"
                                            name="destination"
                                            defaultValue={selectedVoyage.destination}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Enter destination"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                        <input
                                            type="number"
                                            name="prix"
                                            defaultValue={selectedVoyage.prix}
                                            required
                                            min="0"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Enter price"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                                        <input
                                            type="date"
                                            name="dateDeDepart"
                                            defaultValue={new Date(selectedVoyage.dateDeDepart).toISOString().split('T')[0]}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                        <input
                                            type="date"
                                            name="dateDeRetour"
                                            defaultValue={new Date(selectedVoyage.dateDeRetour).toISOString().split('T')[0]}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Places</label>
                                    <input
                                        type="number"
                                        name="placesDisponible"
                                        defaultValue={selectedVoyage.placesDisponible}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter number of available places"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                                    <input
                                        type="url"
                                        name="photo"
                                        defaultValue={selectedVoyage.photo}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter photo URL (e.g., https://example.com/photo.jpg)"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Enter a valid URL for the voyage photo
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={selectedVoyage.description}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Enter voyage description"
                                    />
                                </div>

                                <div className="flex justify-end gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditVoyageModalOpen(false);
                                            setSelectedVoyage(null);
                                        }}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        Update Voyage
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssociationDashboard;