require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });



async function connectDB() {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    return client.db(process.env.DB_NAME);
}
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // True if port is 465, false for other ports like 587
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});


async function sendEmail(email, frameUrl) {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Your Photostrip from GENIC',
        text: 'Attached is your photostrip with the chosen frame. Enjoy!',
        attachments: [
            { filename: 'photostrip.pdf', path: frameUrl }
        ]
    };

    let info = await transporter.sendMail(mailOptions);
    return info;
}


app.post('/send-photo', async (req, res) => {
    const { email, frameUrl, consent } = req.body;

    if (consent !== true) {
        return res.status(403).send({ message: 'Consent for promotional emails is required.' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('emails');
        await collection.insertOne({ email: email, consent: consent });

        const emailInfo = await sendEmail(email, frameUrl);
        res.send({ success: true, message: 'Email sent successfully', id: emailInfo.messageId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Failed to send email', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
