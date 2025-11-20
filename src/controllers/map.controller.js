import * as openweathermapService from '../services/openweathermap.service.js';

export async function searchLocation(req, res) {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Cần cung cấp query string (q)' });
    }
    
    const results = await openweathermapService.searchLocation(q);
    
    if (results.error) {
      return res.status(404).json(results);
    }
    
    res.json({
      query: q,
      results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Search Location Error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm địa điểm' });
  }
}

export async function reverseGeocode(req, res) {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Cần cung cấp lat và lon' });
    }
    
    const location = await openweathermapService.reverseGeocode(
      parseFloat(lat),
      parseFloat(lon)
    );
    
    if (location.error) {
      return res.status(404).json(location);
    }
    
    res.json(location);
    
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
    res.status(500).json({ error: 'Lỗi khi tìm địa điểm' });
  }
}