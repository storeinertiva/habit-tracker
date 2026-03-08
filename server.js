require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCT_PRICE = 200; // ₹2 test price

// Razorpay initialization (ONLY ONCE)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*
CREATE ORDER
*/
app.post('/api/create-order', async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 5400,
      currency: 'INR',
      receipt: 'receipt_order_1'
    });

    return res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Unable to create order'
    });
  }
});

/*
VERIFY PAYMENT
*/
app.post('/api/verify-payment', async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected === razorpay_signature) {

    try {

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Habit Tracker',
        text: 'Thank you for your purchase. Your file is attached.',
        attachments: [
          {
            filename: 'habit-tracker.xlsx',
            path: './uploads/habit-tracker.xlsx'
          }
        ]
      });

      res.json({ success: true });

    } catch (err) {

      console.error('EMAIL ERROR:', err);
      res.status(500).json({ error: 'Email failed' });

    }

  } else {

    res.status(400).json({ error: 'Payment verification failed' });

  }

});

/*
START SERVER
*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
