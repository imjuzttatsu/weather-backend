import express from 'express';
import * as mapController from '../controllers/map.controller.js';

const router = express.Router();

router.get('/search', mapController.searchLocation);
router.get('/reverse', mapController.reverseGeocode);

export default router;