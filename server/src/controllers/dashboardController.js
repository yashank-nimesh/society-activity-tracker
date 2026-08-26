const User = require('../models/User');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const Contribution = require('../models/Contribution');
const catchAsync = require('../utils/catchAsync');
const { computeMemberActivity } = require('../services/activityService');

// GET /api/dashboard/summary (admin only)
// Aggregates everything the admin dashboard needs in one call to keep the
// frontend simple.
exports.getSummary = catchAsync(async (req, res) => {
  const members = await User.find({ role: 'MEMBER' });

  const activityList = await Promise.all(
    members.map(async (m) => {
      const activity = await computeMemberActivity(m._id);
      return { member: m, activity };
    })
  );

  const totalMembers = members.length;
  const activeCount = activityList.filter((a) => a.activity.activityStatus === 'ACTIVE').length;
  const lowActivityCount = activityList.filter(
    (a) => a.activity.activityStatus === 'LOW ACTIVITY'
  ).length;
  const inactiveCount = activityList.filter(
    (a) => a.activity.activityStatus === 'INACTIVE'
  ).length;

  const topMembers = [...activityList]
    .sort((a, b) => b.activity.totalActivityScore - a.activity.totalActivityScore)
    .slice(0, 5)
    .map((a) => ({
      id: a.member._id,
      name: a.member.name,
      department: a.member.department,
      totalActivityScore: a.activity.totalActivityScore,
      activityStatus: a.activity.activityStatus,
    }));

  const mostConsistent = [...activityList]
    .sort((a, b) => b.activity.attendancePercentage - a.activity.attendancePercentage)
    .slice(0, 5)
    .map((a) => ({
      id: a.member._id,
      name: a.member.name,
      attendancePercentage: a.activity.attendancePercentage,
    }));

  const recentEvents = await Event.find().sort({ date: -1 }).limit(5);
  const recentAttendance = await Attendance.find()
    .sort({ checkedInAt: -1 })
    .limit(5)
    .populate('member', 'name')
    .populate('event', 'title');
  const recentContributions = await Contribution.find()
    .sort({ date: -1 })
    .limit(5)
    .populate('member', 'name');

  res.status(200).json({
    success: true,
    data: {
      summaryCards: {
        totalMembers,
        activeMembers: activeCount,
        lowActivity: lowActivityCount,
        inactiveMembers: inactiveCount,
      },
      statusDistribution: [
        { status: 'ACTIVE', count: activeCount },
        { status: 'LOW ACTIVITY', count: lowActivityCount },
        { status: 'INACTIVE', count: inactiveCount },
      ],
      topMembers,
      mostConsistent,
      recentEvents,
      recentAttendance,
      recentContributions,
    },
  });
});
