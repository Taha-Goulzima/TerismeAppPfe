  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{association.nom}</h1>
                <p className="text-sm text-gray-500">{association.email}</p>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  association.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {association.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              {association.status === 'active' && (
                <button
                  onClick={() => setIsAddVoyageModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Add New Voyage
                </button>
              )}
            </div>

            {/* Rest of the component */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Voyages</h2>
              {voyages.length === 0 ? (
                <p className="text-gray-500">No voyages found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {voyages.map((voyage) => (
                    <div key={voyage._id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={voyage.photo || 'https://via.placeholder.com/150'}
                              alt=""
                            />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {voyage.destination}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                  {voyage.prix} DH
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-gray-500">
                            <p>Date: {new Date(voyage.date).toLocaleDateString()}</p>
                            <p>Duration: {voyage.duree}</p>
                            <p>Description: {voyage.description}</p>
                          </div>
                        </div>
                        {association.status === 'active' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => handleEditVoyage(voyage)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVoyage(voyage._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ... rest of the component ... */}
    </div>
  ); 