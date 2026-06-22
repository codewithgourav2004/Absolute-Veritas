require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: 'cs@absoluteveritas.com' });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  await User.create({
    name: 'Gourav',
    email: 'cs@absoluteveritas.com',
    password: 'gourav123',
    role: 'admin',
  });

  console.log('Admin user created: cs@absoluteveritas.com');
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
