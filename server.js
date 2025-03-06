require('dotenv').config();
console.log('Email Username:', process.env.EMAIL_USERNAME);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000', // or your frontend URL
    credentials: true
}));

app.post('/send-photo', async (req, res) => {
    const { email, imageData, subject, message } = req.body;
    const mailOptions = {
        from: marketing@genic.film
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

