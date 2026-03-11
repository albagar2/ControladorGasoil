import { Request, Response } from 'express';
import { DriveService } from '../services/drive.service';
import { asyncHandler } from '../utils/asyncHandler';

export const cleanupOldPhotos = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const { role } = req.user;

    if (role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Only admins can cleanup old photos" });
    }

    const deletedCount = await DriveService.cleanupOldFiles();
    res.json({ message: `Successfully deleted ${deletedCount} old photos`, deletedCount });
});
