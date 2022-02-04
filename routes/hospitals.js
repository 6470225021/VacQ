const express = require('express');
const {getHopitals, getHopital, createHospital, updateHospital, deleteHospital} = require('../controllers/hospitals');

const router = express.Router();

router.route('/').get(getHopitals).post(createHospital);
router.route('/:id').get(getHopital).put(updateHospital).delete(deleteHospital);

module.exports=router;