import * as openMeteoService from '../services/openmeteo.service.js';
import * as openweathermapService from '../services/openweathermap.service.js';

export async function getCurrentWeather(req, res) {
  try {
    let { city, lat, lon } = req.query;
    
    console.log(`[WEATHER] Request for city: ${city}, lat: ${lat}, lon: ${lon}`);
    
    if (city && (!lat || !lon)) {
      console.log(`[WEATHER] geocoding city: ${city}`);
      const locations = await openweathermapService.searchLocation(city);
      
      if (!Array.isArray(locations) || locations.length === 0 || locations.error) {
        console.error(`[WEATHER] city not found: ${city}`);
        return res.status(404).json({ error: 'khong tim thay dia diem' });
      }
      
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
      console.log(`[WEATHER] geocoded to: ${city} (${lat}, ${lon})`);
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'can cung cap city hoac lat/lon' 
      });
    }
    
    console.log(`[WEATHER] Fetching weather for: ${lat}, ${lon}`);
    const weather = await openMeteoService.getCurrentWeather(
      parseFloat(lat), 
      parseFloat(lon)
    );
    console.log(`[WEATHER] Weather code received: ${weather.weatherCode}, condition: ${weather.condition}`);
    
    if (!city) {
      const location = await openweathermapService.reverseGeocode(
        parseFloat(lat), 
        parseFloat(lon)
      );
      if (location.error) {
        console.warn(`[WEATHER] reverse geocode failed for ${lat}, ${lon}`);
        city = 'Unknown Location';
      } else {
        city = location.nameVi || location.name;
      }
    }
    
    res.json({
      location: {
        city,
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      weather,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('current weather error:', error);
    res.status(500).json({ 
      error: 'loi khi lay thoi tiet hien tai',
      message: error.message 
    });
  }
}

export async function getForecast(req, res) {
  try {
    let { city, lat, lon, days = 7 } = req.query;
    
    if (city && (!lat || !lon)) {
      const locations = await openweathermapService.searchLocation(city);
      if (!Array.isArray(locations) || locations.length === 0 || locations.error) {
        return res.status(404).json({ error: 'khong tim thay dia diem' });
      }
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'can cung cap city hoac lat/lon' });
    }
    
    const forecast = await openMeteoService.getWeatherForecast(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(days)
    );
    
    res.json({
      location: {
        city,
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      forecast,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('forecast error:', error);
    res.status(500).json({ error: 'loi khi lay du bao thoi tiet' });
  }
}

export async function getHourlyForecast(req, res) {
  try {
    let { city, lat, lon, hours = 24 } = req.query;
    
    if (city && (!lat || !lon)) {
      const locations = await openweathermapService.searchLocation(city);
      if (!Array.isArray(locations) || locations.length === 0 || locations.error) {
        return res.status(404).json({ error: 'khong tim thay dia diem' });
      }
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'can cung cap city hoac lat/lon' });
    }
    
    const hourlyForecast = await openMeteoService.getHourlyForecast(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(hours)
    );
    
    res.json({
      location: { city, lat: parseFloat(lat), lon: parseFloat(lon) },
      hourly: hourlyForecast,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('hourly forecast error:', error);
    res.status(500).json({ error: 'loi khi lay du bao theo gio' });
  }
}