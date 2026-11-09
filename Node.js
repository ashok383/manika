const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());

// Initialize Twilio client (store credentials safely in environment variables)
const accountSid = 'ACc608b42834ad8552722f8a7f6058b503';
const authToken = 'aaa5f4d3bd5ac29ef1c5957da4cd89f7';
const client = twilio(accountSid, authToken);

// Temporary in-memory store for OTPs (Use Redis or a Database in production)
const otpStore = {};

app.post('/api/send-otp', async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP with a 5-minute expiration timestamp
    otpStore[mobile] = {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000 
    };

    try {
        // Send SMS via Twilio
        await client.messages.create({
            body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            from: '+1234567890', // Your Twilio phone number
            to: mobile
        });

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send SMS' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
