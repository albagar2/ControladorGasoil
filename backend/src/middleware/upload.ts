import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') + '_' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');
        // Usamos un ID único temporal, el controlador le pondrá la matrícula después
        const uniqueId = Math.random().toString(36).substring(2, 7);
        cb(null, `TEMP_${timestamp}_${uniqueId}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagen no soportado: ' + file.mimetype));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
