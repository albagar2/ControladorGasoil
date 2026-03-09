
import dotenv from "dotenv";
import { emailService } from "./services/email.service";

dotenv.config();

console.log("--- SMTP DIAGNOSTIC TEST ---");
console.log("User:", process.env.SMTP_USER);
console.log("Host:", process.env.SMTP_HOST || "smtp.gmail.com");
console.log("Port:", process.env.SMTP_PORT || "587");
console.log("----------------------------");

async function runTest() {
    console.log("Starting SMTP verification...");
    const success = await emailService.verifyConnection();

    if (success) {
        console.log("✅ Email service connected successfully!");
    } else {
        console.error("❌ Email service failed to connect.");
        console.log("TIP: If using Gmail, make sure you use an 'App Password', not your main account password.");
    }
}

runTest();
