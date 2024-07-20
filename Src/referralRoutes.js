// referralRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { referrer, referred } = req.body;
    const referral = await prisma.referral.create({
      data: {
        referrer,
        referred,
      },
    });
    await sendReferralEmail(referral.id);
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create referral' });
  }
});

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
    to: 'recipient@example.com',
    subject: 'New Referral',
    text: `You have received a new referral.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
