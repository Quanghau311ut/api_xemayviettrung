const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/sent', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Tạo một bức thư
        const mailOptions = {
            from: 'your-email@gmail.com', // Email của bạn
            to: 'quanghau311ut@gmail.com', // Email đích
            subject: 'Thông điệp từ website', // Tiêu đề email
            text: `Tên: ${name}\nEmail: ${email}\nNội dung: ${message}` // Nội dung email
        };

        // Gửi email
        const info = await sendEmail(mailOptions);

        console.log('Email sent: ' + info.response);
        res.status(200).send('Email đã được gửi thành công!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi gửi email');
    }
});

// Hàm gửi email
async function sendEmail(mailOptions) {
    // Tạo transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'your-email@gmail.com', // Email của bạn
            pass: 'your-password' // Mật khẩu email của bạn
        }
    });

    // Gửi email và trả về thông tin
    return await transporter.sendMail(mailOptions);
}

module.exports = router;
