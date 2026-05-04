import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
};

function App() {
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const searchRestaurants = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/restaurants?address=${encodeURIComponent(address)}&ratingFilter=${rating}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error);
        return;
      }

      setData(result);
    } catch (err) {
      setError('Failed to connect to the backend server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Google Places Restaurant Finder</h1>

        {/* Input Form */}
        <form onSubmit={searchRestaurants} className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter an address (e.g., 1600 Amphitheatre Pkwy)..."
            className="flex-1 border border-gray-300 p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <select
            className="border border-gray-300 p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">Filter by Rating (Any)</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded shadow-sm hover:bg-blue-700 transition font-medium">
            Search
          </button>
        </form>

        {/* Error Message */}
        {error && <div className="text-red-700 bg-red-100 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

        {/* Results & Map Area */}
        {data && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* List of Results */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Nearby Restaurants ({data.restaurants.length})</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {data.restaurants.map((place) => (
                  <div key={place.place_id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-800">{place.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{place.vicinity}</p>
                    <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                      Rating: {place.rating} ⭐
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Map */}
            <div className="flex-1 border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={data.location}
                  zoom={14}
                >
                  {/* Map marker for the searched address */}
                  <Marker position={data.location} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />

                  {/* Map markers for restaurants */}
                  {data.restaurants.map((place) => (
                    <Marker
                      key={place.place_id}
                      position={{
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                      }}
                      title={place.name}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;