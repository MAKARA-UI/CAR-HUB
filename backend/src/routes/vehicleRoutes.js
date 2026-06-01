const express = require('express');
const { 
  getVehicles, 
  getVehicleById, 
  createVehicle, 
  uploadVehicleImage,
  updateVehicle, 
  deleteVehicle 
} = require('../controllers/vehicleController');
const { protect, isDriver } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/upload-image', protect, isDriver, uploadVehicleImage);
router.post('/', protect, isDriver, createVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
