import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import createError from 'http-errors';
import { Request } from 'express';

interface MulterRequest extends Request {
  body: {
    fileUploadPath?: string;
    filename?: string;
    [key: string]: any;
  };
}

function createRoute(req: MulterRequest, fieldName: string): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  const directory = path.join(__dirname, '..', 'uploads', fieldName, year, month, day);
  req.body.fileUploadPath = path.join('uploads', fieldName, year, month, day);

  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file?.originalname) {
      const filePath = createRoute(req as MulterRequest, file.fieldname);
      return cb(null, filePath);
    }
    cb(new Error('Invalid file'), '');
  },
  filename: (req, file, cb) => {
    if (file.originalname) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}${ext}`;
      (req as MulterRequest).body.filename = fileName;
      return cb(null, fileName);
    }
    cb(new Error('Invalid file'), '');
  },
});

function imageFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedExtensions.includes(ext)) return cb(null, true);
  return cb(createError.BadRequest('فقط فرمت‌های تصویری مجاز هستند.'));
}

function pdfFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') return cb(null, true);
  return cb(createError.BadRequest('فقط فایل PDF مجاز است.'));
}

const avatarMaxSize = 2 * 1000 * 1000;
const pdfMaxSize = 10 * 1000 * 1000;

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: avatarMaxSize },
});

export const uploadPDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: pdfMaxSize },
});
