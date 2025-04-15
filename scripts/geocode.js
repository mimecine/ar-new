import dotenv from "dotenv";

dotenv.config();

import { Client }  from "@googlemaps/google-maps-services-js";

const client = new Client({}); // Create your client

async function getCoordinates(place) {
  try {
    const response = await client.geocode({
      params: {
        address: place,
        key: process.env.GOOGLE_API_KEY 
      }
    });

    if (response.data.status === 'OK') {
      console.log(response.data.results[0]?.place_id);
      const location = response.data.results[0].geometry.location;
      console.log(`Latitude: ${location.lat}`);
      console.log(`Longitude: ${location.lng}`);
    } else {
      console.error("Geocoding failed:", response.data.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function with your query 
getCoordinates("Tate Modern Bankside");  
console.log(client)