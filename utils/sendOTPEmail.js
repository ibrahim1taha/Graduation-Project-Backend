const nodemailer = require('nodemailer');

const sendOTPEmail = (email, otp, name) => {
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS
		},
	});

	const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0084FE; color: white; text-align: center; padding: 20px; font-size: 24px; }
        .content { padding: 20px; text-align: center; color: #333; }
        .otp-code { display: inline-block; background-color: #f9f9f9; padding: 10px 20px; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #0084FE; border: 1px solid #ddd; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; background-color: #f4f4f4; }
        .button { background-color: #0084FE; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; margin-top: 20px; font-size: 16px; }
        .button:hover { background-color: #45a049; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">OTP Verification</div>
        <div class="content">
          <p>Hello, ${name}</p>
          <p>Your OTP for verification is:</p>
          <div class="otp-code">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          © 2024 Grad Project Backend Team . All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

	const mailOptions = {
		from: process.env.MAIL_USER,
		to: email,
		subject: 'Your OTP Verification Code',
		html: htmlTemplate,
	};

	try {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) console.log('Error : ', err);
			else console.log('Email sent : ', info.response);
		})
	} catch (error) {
		console.log('Email error :: ', error);
	}

}

module.exports = {
	sendOTPEmail
} 