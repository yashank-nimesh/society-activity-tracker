// Seed script: wipes the relevant collections and creates demo data so the
// app is immediately useful the first time you run it.
//seed.js is the file for filling temporary data for the first time startup

require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const Attendance = require('./src/models/Attendance');
const Contribution = require('./src/models/Contribution');
const { attendancePointsForEventType, contributionPointsForType } = require('./src/services/activityService');

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function run() {
  await connectDB(process.env.MONGO_URI);

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Attendance.deleteMany({}),
    Contribution.deleteMany({}),
  ]);

  console.log('Creating admin...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await User.create({
    name: 'Society Admin',
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    department: 'Core Committee',
    position: 'President',
    joiningDate: daysFromNow(-400),
  });

  console.log('Creating members...');
  const memberSeed = [
    { name: 'Aisha Khan', email: 'aisha@example.com', department: 'Technical', position: 'Member' },
    { name: 'Rohan Mehta', email: 'rohan@example.com', department: 'Design', position: 'Member' },
    { name: 'Priya Sharma', email: 'priya@example.com', department: 'Content', position: 'Lead' },
    { name: 'Karan Verma', email: 'karan@example.com', department: 'Outreach', position: 'Member' },
    { name: 'Sneha Iyer', email: 'sneha@example.com', department: 'Management', position: 'Coordinator' },
    { name: 'Dev Patel', email: 'dev@example.com', department: 'Technical', position: 'Member' },
  ];

  const memberPasswordHash = await bcrypt.hash('Member@123', 10);
  const members = [];
  for (const m of memberSeed) {
    const member = await User.create({
      ...m,
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
      joiningDate: daysFromNow(-Math.floor(Math.random() * 300) - 30),
    });
    members.push(member);
  }

  console.log('Creating events...');
  const eventDefs = [
    { title: 'Orientation Session', type: 'Orientation', offset: -60 },
    { title: 'Weekly Sync #1', type: 'Weekly Meeting', offset: -50 },
    { title: 'Web Dev Workshop', type: 'Workshop', offset: -42 },
    { title: 'Weekly Sync #2', type: 'Weekly Meeting', offset: -35 },
    { title: 'Project Kickoff Meeting', type: 'Project Meeting', offset: -28 },
    { title: 'Weekly Sync #3', type: 'Weekly Meeting', offset: -21 },
    { title: 'Annual Tech Fest', type: 'Event', offset: -10 },
    { title: 'Weekly Sync #4', type: 'Weekly Meeting', offset: -3 },
  ];

  const events = [];
  for (const def of eventDefs) {
    const date = daysFromNow(def.offset);
    const checkInStart = new Date(date);
    checkInStart.setHours(9, 0, 0, 0);
    const checkInEnd = new Date(date);
    checkInEnd.setHours(23, 0, 0, 0);

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    const event = await Event.create({
      title: def.title,
      date,
      startTime: '10:00',
      type: def.type,
      checkInCode: code,
      checkInStart,
      checkInEnd,
      createdBy: admin._id,
    });
    events.push(event);
  }

  console.log('Creating attendance records...');
  // Give each member a semi-random but plausible attendance pattern so the
  // dashboard shows a mix of ACTIVE / LOW ACTIVITY / INACTIVE members.
  const attendancePattern = [
    [0, 1, 2, 3, 4, 5, 6, 7], // Aisha: attends everything -> ACTIVE
    [0, 1, 3, 5, 7],          // Rohan: solid attendance -> ACTIVE
    [0, 2, 4],                // Priya: attended earlier events only, nothing recent -> LOW/INACTIVE
    [0, 1],                   // Karan: barely attends -> INACTIVE
    [1, 2, 3, 4, 5, 6, 7],    // Sneha: very consistent -> ACTIVE
    [5, 6],                   // Dev: only recent ones -> possibly LOW ACTIVITY
  ];

  for (let i = 0; i < members.length; i++) {
    const indices = attendancePattern[i] || [];
    for (const idx of indices) {
      const event = events[idx];
      await Attendance.create({
        member: members[i]._id,
        event: event._id,
        checkedInAt: event.date,
        attendancePoints: attendancePointsForEventType(event.type),
      });
    }
  }

  console.log('Creating contributions...');
  const contributionDefs = [
    { memberIdx: 0, title: 'Built registration portal', category: 'Technical', type: 'MAJOR' },
    { memberIdx: 0, title: 'Fixed website bugs', category: 'Technical', type: 'MINOR' },
    { memberIdx: 1, title: 'Designed event poster', category: 'Design', type: 'MINOR' },
    { memberIdx: 1, title: 'Full rebrand of society logo', category: 'Design', type: 'MAJOR' },
    { memberIdx: 2, title: 'Wrote newsletter', category: 'Content', type: 'MINOR' },
    { memberIdx: 4, title: 'Coordinated venue logistics', category: 'Event Operations', type: 'MAJOR' },
    { memberIdx: 5, title: 'Set up sponsor outreach sheet', category: 'Outreach', type: 'MINOR' },
  ];

  for (const c of contributionDefs) {
    await Contribution.create({
      member: members[c.memberIdx]._id,
      title: c.title,
      description: `${c.title} for the society.`,
      category: c.category,
      date: daysFromNow(-Math.floor(Math.random() * 40)),
      points: contributionPointsForType(c.type),
      loggedBy: admin._id,
    });
  }

  console.log('\nSeed complete!');
  console.log('Admin login  -> admin@example.com / Admin@123');
  console.log('Member login -> aisha@example.com / Member@123 (all members share this password)');
  console.log('\nEvent check-in codes (for testing check-in flow):');
  events.forEach((e) => console.log(`  ${e.title}: ${e.checkInCode}`));

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
