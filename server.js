require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Set up CORS to allow requests from your front-end origin
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(cors());
 app.options('*', cors());
 
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Log the email username for debugging
console.log('Email Username:', process.env.EMAIL_USERNAME);

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// POST endpoint to send photo via email
app.post('/send-photo', async (req, res) => {
    console.log("Received request:", req.body);
    const { email, imageData, subject, message } = req.body;
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject || 'Your GENIC Photostrip',
        html: `<p>${message || 'Attached is your photostrip.'}</p>`,
        attachments: [{
            filename: 'genic-photostrip.png',
            content: imageData.split("base64,")[1],
            encoding: 'base64'
        }]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));