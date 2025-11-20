import express from 'express';
import * as weatherController from '../controllers/weather.controller.js';

const router = express.Router();

router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getForecast);
router.get('/hourly', weatherController.getHourlyForecast);

export default router;