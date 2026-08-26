const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getEvents, getEventById, createEvent } = require('../controllers/eventController');

const router = express.Router();

router.use(authenticate);

router.get('/', getEvents); // both roles need to see events
router.get('/:id', getEventById);
router.post('/', requireAdmin, createEvent);

module.exports = router;
