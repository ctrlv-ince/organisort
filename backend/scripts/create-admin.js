const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB();
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check for an existing admin user
    const existingAdmin = await User.findOne({ email: adminEmail });

    // If the user exists, delete it to ensure a clean slate
    if (existingAdmin) {
      await User.deleteOne({ email: adminEmail });
      console.log('Existing admin user found and removed. Re-creating...');
    }

    // Create the admin user with an unhashed password
    // The pre-save hook in the User model will handle hashing
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword, // The model will hash this
      role: 'admin',
      displayName: 'Admin'
    });

    // Save the new admin user
    await adminUser.save();
    console.log('Admin user created successfully.');

  } catch (error) {
    console.error('Error during admin user creation:', error);
  } finally {
    // Disconnect from the database
    await disconnectDB();
  }
};

createAdmin();