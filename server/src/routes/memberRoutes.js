const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getMembers,
  getMemberById,
  createMember,
  setMemberStatus,
  getMemberActivity,
  getMyActivity,
} = require('../controllers/memberController');

const router = express.Router();

router.use(authenticate);

// IMPORTANT: /me/activity must be registered before /:id/activity, otherwise
// Express would treat "me" as an :id value.
router.get('/me/activity', getMyActivity);

router.get('/', requireAdmin, getMembers);
router.post('/', requireAdmin, createMember);
router.get('/:id', requireAdmin, getMemberById);
router.patch('/:id/status', requireAdmin, setMemberStatus);
router.get('/:id/activity', requireAdmin, getMemberActivity);

module.exports = router;
