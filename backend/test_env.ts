import dotenv from 'dotenv';
dotenv.config();

console.log("Email: ", process.env.GOOGLE_CLIENT_EMAIL?.substring(0, 10) + '...');
const key = process.env.GOOGLE_PRIVATE_KEY;
console.log("Raw key prefix: ", key?.substring(0, 30));
console.log("Replaced key prefix: ", key?.replace(/\\n/g, '\n').substring(0, 30));
console.log("Folder: ", process.env.GOOGLE_FOLDER_ID);
