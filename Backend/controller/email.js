const nodemailer = require('nodemailer');
require('dotenv').config();
const min = 1;
const max = 10;
let tempStore = [];
const sendEmail = async (req, res) => {
    for (let index = 0; index < 6; index++) {
        tempStore[index] = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const verificationCode = Number(tempStore.join(''));
    console.log(verificationCode);


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'haimhuber90@gmail.com',
            pass: 'gdobkjqguxezvmnv'
        }
    });

    // הגדרת ההודעה
    const mailOptions = {
        from: 'haimhuber90@gmail.com',
        to: 'haimhuber90@gmail.com' , //req.params.email
        subject: 'Crossfit power house',
        text: `This is your verification code: ${verificationCode}`
    };

    // שליחה
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('שגיאה בשליחה:', error);
            res.status(404).send({ status: 404, code: false });
        } else {
            res.status(200).send({ status: 200, code: verificationCode });
        }
    });

}

module.exports.sendEmail = sendEmail;