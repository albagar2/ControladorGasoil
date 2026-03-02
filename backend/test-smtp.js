
const nodemailer = require('nodemailer');

const config = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'controlgasoilfamiliar@gmail.com',
        pass: 'usoAplicacionWeb',
    },
};

console.log('Testing SMTP with config:', JSON.stringify({ ...config, auth: { ...config.auth, pass: '****' } }));

const transporter = nodemailer.createTransport(config);

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection failed:', error);
    } else {
        console.log('✅ SMTP Connection verified successfully');
    }
    process.exit();
});

// Set a timeout
setTimeout(() => {
    console.error('❌ SMTP Connection timed out after 10 seconds');
    process.exit(1);
}, 10000);
