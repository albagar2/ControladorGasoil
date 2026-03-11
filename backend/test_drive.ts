import { DriveService } from './src/services/drive.service';

async function test() {
    console.log("Testing drive auth...");
    try {
        const count = await DriveService.cleanupOldFiles();
        console.log("Success! Authenticated properly and found " + count + " old files.");
    } catch (e) {
        console.error("Auth test failed:", e);
    }
}
test();
