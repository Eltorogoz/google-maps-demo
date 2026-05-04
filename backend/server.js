require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.get('/api/restaurants', async (req, res) => {
  try {
    const { address, ratingFilter } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Requirement 1: Convert Address to Coordinates
    const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: { address, key: GOOGLE_API_KEY }
    });

    // Debugging line to capture Google's exact response
    console.log("GOOGLE GEOCODING RESPONSE:", geoResponse.data);

    if (geoResponse.data.status !== 'OK' || geoResponse.data.results.length === 0) {
      return res.status(404).json({ error: 'Could not find coordinates for this address.' });
    }

    const { lat, lng } = geoResponse.data.results[0].geometry.location;

    // Requirement 2: Find nearby restaurants
    const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${lat},${lng}`,
        radius: 1500, // 1.5 km radius
        type: 'restaurant',
        key: GOOGLE_API_KEY
      }
    });

    let restaurants = placesResponse.data.results;

    if (!restaurants || restaurants.length === 0) {
       return res.status(404).json({ error: 'No restaurants found near this location.' });
    }

    // Requirement 3: Add a filter for restaurant ratings
    if (ratingFilter) {
      const targetRating = parseInt(ratingFilter);
      // Flooring the rating to match exact whole numbers like 3, 4, or 5
      restaurants = restaurants.filter(r => Math.floor(r.rating) === targetRating);
    }

    if (restaurants.length === 0) {
        return res.status(404).json({ error: 'No restaurants match your rating filter.' });
    }

    res.json({
      location: { lat, lng },
      restaurants
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: 'Server error fetching data from Google APIs.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
