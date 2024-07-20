require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

// Apply CORS middleware to allow cross-origin requests
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Define the /api/referrals POST endpoint
app.post('/api/referrals', async (req, res) => {
  try {
    const { referrerName, referrerEmail, friendName, refereeEmail } = req.body;
    // Create a new referral record in the database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        friendName,
        refereeEmail,
      },
    });
    // Send an email notification about the new referral
    await sendReferralEmail(referral.id);
    // Respond with the newly created referral data
    res.status(201).json(referral);
  } catch (error) {
    // Handle errors and respond with an appropriate status code
    res.status(500).json({ error: 'Unable to create referral' });
  }
});

// Function to send an email notification about a new referral
async function sendReferralEmail(referralId) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS,
    },
  });

  const mailOptions = {
    from: '"Your Company" <noreply@yourcompany.com>',
    to: 'recipient@example.com', // Consider making this dynamic based on the referral details
    subject: 'New Referral',
    text: `You have received a new referral.`,
  };

  await transporter.sendMail(mailOptions);
}

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export the app for potential use elsewhere
