import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// Then import the service
import { emailService } from './src/services/email.service';

async function testEmail() {
    console.log('--- Email Service Diagnostic ---');
    console.log('User:', process.env.SMTP_USER);
    console.log('OAuth2 Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('OAuth2 Refresh Token:', process.env.GOOGLE_REFRESH_TOKEN ? 'Present' : 'Missing');
    console.log('SMTP Pass:', process.env.SMTP_PASS ? 'Present' : 'Missing');
    
    console.log('\nVerifying connection...');
    const isConnected = await emailService.verifyConnection();
    
    if (isConnected) {
        console.log('\n✅ Success! The email service is connected.');
        console.log('You can now push these changes to GitHub and Render.');
    } else {
        console.log('\n❌ Failed to connect.');
        console.log('Please check your .env file or verify why both OAuth2 and SMTP are failing.');
    }
}

testEmail();
