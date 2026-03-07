require('dotenv').config();

const path = require('path');
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCT_PRICE = 200; // ₹2 test price

app.use(helmet());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/create-order', async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 200,
      currency: 'INR',
      receipt: 'order_' + Date.now()
    });

    return res.json({
      id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('RAZORPAY ERROR:', err);
    return res.status(500).json({
      error: 'Unable to create order'
    });
  }
});

app.get('/api/product', (_req, res) => {
  return res.json({
    price: PRODUCT_PRICE / 100,
    key: process.env.RAZORPAY_KEY_ID || ''
  });
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      email
    } = req.body;

    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }

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
      subject: 'Your Excel Habit Tracker',
      text: 'Thank you for purchasing. Your tracker is attached.',
      attachments: [
        {
          filename: 'habit-tracker.xlsx',
          path: path.join(__dirname, 'uploads', 'habit-tracker.xlsx')
        }
      ]
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Payment verified but email failed.' });
  }
});

app.get('/download', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

app.get('/api/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
