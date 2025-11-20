import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org';

export async function searchLocation(query) {
  try {
    const url = `${OPENWEATHER_BASE_URL}/geo/1.0/direct`;
    
    const response = await axios.get(url, {
      params: {
        q: query,
        limit: 5,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (!response.data || response.data.length === 0) {
      return { error: 'Không tìm thấy địa điểm' };
    }

    const results = response.data.map(location => ({
      name: `${location.name}, ${location.country}`,
      nameVi: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state || '',
      placeType: 'place'
    }));

    return results;
  } catch (error) {
    console.error('OpenWeatherMap Geocoding Error:', error.message);
    throw new Error('Lỗi khi tìm kiếm địa điểm');
  }
}

export async function reverseGeocode(lat, lon) {
  try {
    try {
      const nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';
      const nominatimResponse = await axios.get(nominatimUrl, {
        params: {
          lat: lat,
          lon: lon,
          format: 'json',
          addressdetails: 1,
          'accept-language': 'vi'
        },
        headers: {
          'User-Agent': 'PleasantWeatherApp/1.0'
        }
      });

      if (nominatimResponse.data && nominatimResponse.data.address) {
        const addr = nominatimResponse.data.address;
        
        const addressParts = [];
        
        if (addr.house_number) addressParts.push(addr.house_number);
        if (addr.road || addr.street || addr.pedestrian) {
          const street = addr.road || addr.street || addr.pedestrian;
          if (addr.house_number) {
            addressParts.push(street);
          } else {
            addressParts.push(street);
          }
        }
        if (addr.suburb || addr.neighbourhood) {
          addressParts.push(addr.suburb || addr.neighbourhood);
        }
        if (addr.quarter || addr.city_district) {
          addressParts.push(addr.quarter || addr.city_district);
        }
        if (addr.city || addr.town || addr.village) {
          addressParts.push(addr.city || addr.town || addr.village);
        }
        if (addr.state || addr.region) {
          addressParts.push(addr.state || addr.region);
        }
        
        const detailedAddress = addressParts.join(', ') || nominatimResponse.data.display_name;
        
        return {
          name: detailedAddress,
          nameVi: detailedAddress,
          lat: lat,
          lon: lon,
          country: addr.country || 'Vietnam',
          state: addr.state || addr.region || '',
          city: addr.city || addr.town || addr.village || '',
          district: addr.quarter || addr.city_district || addr.suburb || '',
          street: addr.road || addr.street || addr.pedestrian || '',
          houseNumber: addr.house_number || '',
          placeType: 'place',
          displayName: nominatimResponse.data.display_name
        };
      }
    } catch (nominatimError) {
      console.log('Nominatim error, falling back to OpenWeatherMap:', nominatimError.message);
    }

    const url = `${OPENWEATHER_BASE_URL}/geo/1.0/reverse`;
    
    const response = await axios.get(url, {
      params: {
        lat: lat,
        lon: lon,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (!response.data || response.data.length === 0) {
      return { error: 'Không tìm thấy địa điểm' };
    }

    const location = response.data[0];
    
    return {
      name: `${location.name}, ${location.country}`,
      nameVi: location.name,
      lat: lat,
      lon: lon,
      country: location.country,
      state: location.state || '',
      placeType: 'place'
    };
  } catch (error) {
    console.error('Reverse Geocoding Error:', error.message);
    throw new Error('Lỗi khi tìm địa điểm');
  }
}

