const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getContributions,
  createContribution,
  getContributionsForMember,
} = require('../controllers/contributionController');

const router = express.Router();

router.use(authenticate);

router.get('/', requireAdmin, getContributions);
router.post('/', requireAdmin, createContribution);
router.get('/member/:memberId', getContributionsForMember); // member can view their own

module.exports = router;
