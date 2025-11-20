import * as openMeteoService from '../services/openmeteo.service.js';
import * as openweathermapService from '../services/openweathermap.service.js';

export async function getCurrentWeather(req, res) {
  try {
    let { city, lat, lon } = req.query;
    
    console.log(`[WEATHER] Request for city: ${city}, lat: ${lat}, lon: ${lon}`);
    
    if (city && (!lat || !lon)) {
      console.log(`[WEATHER] Geocoding city: ${city}`);
      const locations = await openweathermapService.searchLocation(city);
      
      if (locations.error || locations.length === 0) {
        console.error(`[WEATHER] City not found: ${city}`);
        return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
      }
      
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
      console.log(`[WEATHER] Geocoded to: ${city} (${lat}, ${lon})`);
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Cần cung cấp city hoặc lat/lon' 
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
      city = location.nameVi || location.name;
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
    console.error('Current Weather Error:', error);
    res.status(500).json({ 
      error: 'Lỗi khi lấy thời tiết hiện tại',
      message: error.message 
    });
  }
}

export async function getForecast(req, res) {
  try {
    let { city, lat, lon, days = 7 } = req.query;
    
    if (city && (!lat || !lon)) {
      const locations = await openweathermapService.searchLocation(city);
      if (locations.error || locations.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
      }
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Cần cung cấp city hoặc lat/lon' });
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
    console.error('Forecast Error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dự báo thời tiết' });
  }
}

export async function getHourlyForecast(req, res) {
  try {
    let { city, lat, lon, hours = 24 } = req.query;
    
    if (city && (!lat || !lon)) {
      const locations = await openweathermapService.searchLocation(city);
      if (locations.error || locations.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
      }
      lat = locations[0].lat;
      lon = locations[0].lon;
      city = locations[0].nameVi;
    }
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Cần cung cấp city hoặc lat/lon' });
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
    console.error('Hourly Forecast Error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dự báo theo giờ' });
  }
}