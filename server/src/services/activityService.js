// all the logic lives here
//the most important file

const Attendance = require('../models/Attendance');
const Contribution = require('../models/Contribution');
const Event = require('../models/Event');

const POINTS = {
  MEETING_ATTENDANCE: 5,
  EVENT_ATTENDANCE: 10,
  MINOR_CONTRIBUTION: 5,
  MAJOR_CONTRIBUTION: 15,
};

// An event counts as a "meeting" for the points table if its type is
// 'Weekly Meeting' or 'Project Meeting'. Everything else (Orientation,
// Workshop, Event) counts as an event/workshop worth more points.
function attendancePointsForEventType(type) {
  if (type === 'Weekly Meeting' || type === 'Project Meeting') {
    return POINTS.MEETING_ATTENDANCE;
  }
  return POINTS.EVENT_ATTENDANCE;
}

function contributionPointsForType(contributionType) {
  return contributionType === 'MAJOR' ? POINTS.MAJOR_CONTRIBUTION : POINTS.MINOR_CONTRIBUTION;
}

// Central function: given a member's id, compute everything the app needs
// to know about their activity. Nothing here is stored directly on the
// User document — it is always derived fresh from Attendance/Contribution
// records, so a member can never fake their own score.
async function computeMemberActivity(memberId) {
  const [attendanceRecords, contributions, totalEvents] = await Promise.all([
    Attendance.find({ member: memberId }).populate('event'),
    Contribution.find({ member: memberId }),
    Event.countDocuments(),
  ]);

  const attendancePoints = attendanceRecords.reduce((sum, a) => sum + a.attendancePoints, 0);
  const contributionPoints = contributions.reduce((sum, c) => sum + c.points, 0);
  const totalActivityScore = attendancePoints + contributionPoints;

  const attendancePercentage =
    totalEvents === 0 ? 0 : Math.round((attendanceRecords.length / totalEvents) * 100);

  const activityStatus = await computeInactivityStatus(memberId);

  return {
    attendancePoints,
    contributionPoints,
    totalActivityScore,
    attendancePercentage,
    contributionCount: contributions.length,
    meetingsAttended: attendanceRecords.length,
    meetingsMissed: Math.max(totalEvents - attendanceRecords.length, 0),
    activityStatus,
  };
}

// Inactivity rule (deterministic, no ML):
// 1. Look at the 3 most recent events (by date) that have already happened.
// 2. INACTIVE  -> the member has zero attendance AND zero contributions
//                 logged during that 3-meeting window.
// 3. LOW ACTIVITY -> the member attended fewer than half of those recent
//                 meetings (and isn't already INACTIVE).
// 4. ACTIVE    -> otherwise.
// If fewer than 3 events exist yet (new society), we simply use however
// many events exist.
async function computeInactivityStatus(memberId) {
  const recentEvents = await Event.find({ date: { $lte: new Date() } })
    .sort({ date: -1 })
    .limit(3);

  if (recentEvents.length === 0) {
    return 'ACTIVE'; // nothing has happened yet, don't penalize anyone
  }

  const recentEventIds = recentEvents.map((e) => e._id.toString());

  const [recentAttendance, recentContributions] = await Promise.all([
    Attendance.find({ member: memberId, event: { $in: recentEventIds } }),
    Contribution.find({
      member: memberId,
      date: { $gte: recentEvents[recentEvents.length - 1].date },
    }),
  ]);

  const hasAnyActivity = recentAttendance.length > 0 || recentContributions.length > 0;

  if (!hasAnyActivity) {
    return 'INACTIVE';
  }

  const attendedHalfOrMore = recentAttendance.length >= Math.ceil(recentEvents.length / 2);

  if (!attendedHalfOrMore) {
    return 'LOW ACTIVITY';
  }

  return 'ACTIVE';
}

module.exports = {
  POINTS,
  attendancePointsForEventType,
  contributionPointsForType,
  computeMemberActivity,
  computeInactivityStatus,
};
