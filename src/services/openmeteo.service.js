import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPEN_METEO_BASE = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

export async function getCurrentWeather(lat, lon) {
  try {
    const url = `${OPEN_METEO_BASE}/forecast`;
    
    console.log(`[OPEN-METEO] Fetching weather for lat: ${lat}, lon: ${lon}`);
    
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'weather_code',
          'wind_speed_10m',
          'wind_direction_10m',
          'precipitation',
          'pressure_msl'
        ].join(','),
        timezone: 'Asia/Bangkok' // GMT+7 cho Việt Nam
      }
    });

    const current = response.data.current;
    const weatherCode = current.weather_code;
    const condition = getWeatherCondition(weatherCode);
    
    console.log(`[OPEN-METEO] Weather code: ${weatherCode}, Condition: ${condition}, Temp: ${current.temperature_2m}°C`);
    
    return {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      weatherCode: weatherCode,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      precipitation: current.precipitation,
      pressure: current.pressure_msl,
      time: current.time,
      condition: condition
    };
  } catch (error) {
    console.error(`[OPEN-METEO] Error for lat: ${lat}, lon: ${lon}:`, error.message);
    if (error.response) {
      console.error(`[OPEN-METEO] Response status: ${error.response.status}`);
      console.error(`[OPEN-METEO] Response data:`, error.response.data);
    }
    throw new Error('Lỗi khi lấy dữ liệu thời tiết');
  }
}

export async function getWeatherForecast(lat, lon, days = 7) {
  try {
    const url = `${OPEN_METEO_BASE}/forecast`;
    
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'relative_humidity_2m_max',
          'sunrise',
          'sunset'
        ].join(','),
        forecast_days: days,
        timezone: 'Asia/Bangkok'
      }
    });

    const daily = response.data.daily;
    
    const forecast = daily.time.map((date, index) => {
      const weatherCode = daily.weather_code[index];
      console.log(`[OPEN-METEO] Forecast day ${index}: weatherCode=${weatherCode}, condition=${getWeatherCondition(weatherCode)}`);
      
      return {
        date: date,
        weatherCode: weatherCode,
        tempMax: daily.temperature_2m_max[index],
        tempMin: daily.temperature_2m_min[index],
        precipitation: daily.precipitation_sum[index],
        precipitationProbability: daily.precipitation_probability_max[index],
        windSpeed: daily.wind_speed_10m_max[index],
        humidity: daily.relative_humidity_2m_max[index],
        pressure: 1013, // Default pressure for daily forecast (Open-Meteo doesn't provide daily pressure)
        sunrise: daily.sunrise[index],
        sunset: daily.sunset[index],
        condition: getWeatherCondition(weatherCode)
      };
    });

    return forecast;
  } catch (error) {
    console.error('Open-Meteo Forecast Error:', error.message);
    throw new Error('Lỗi khi lấy dự báo thời tiết');
  }
}

export async function getHourlyForecast(lat, lon, hours = 24) {
  try {
    const url = `${OPEN_METEO_BASE}/forecast`;
    
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: [
          'temperature_2m',
          'weather_code',
          'precipitation_probability',
          'wind_speed_10m'
        ].join(','),
        forecast_hours: hours,
        timezone: 'Asia/Bangkok'
      }
    });

    const hourly = response.data.hourly;
    
    const forecast = hourly.time.map((time, index) => ({
      time: time,
      temperature: hourly.temperature_2m[index],
      weatherCode: hourly.weather_code[index],
      precipitationProbability: hourly.precipitation_probability[index],
      windSpeed: hourly.wind_speed_10m[index],
      condition: getWeatherCondition(hourly.weather_code[index])
    }));

    return forecast;
  } catch (error) {
    console.error('Open-Meteo Hourly Forecast Error:', error.message);
    throw new Error('Lỗi khi lấy dự báo theo giờ');
  }
}

function getWeatherCondition(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return conditions[code] || 'Unknown';
}

export function getWeatherIcon(code) {
  if (code === 0) return 0;
  
  if (code === 1) return 1;
  
  if (code === 2) return 1;
  
  if (code === 3) return 1;
  
  if ([45, 48].includes(code)) return 1;
  
  if ([51, 53, 55, 61, 80].includes(code)) return 3;
  
  if ([63, 65, 81, 82].includes(code)) return 3;
  
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 5;
  
  if ([95, 96, 99].includes(code)) return 4;
  
  return 1;
}