import multer from 'multer';

// Memory storage keeps file buffers safe in memory for text/PDF parsing without leaving residual temp files
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/octet-stream',
    ];
    const allowedExts = ['.pdf', '.txt', '.md'];
    const isMimeOk = allowedMimes.includes(file.mimetype);
    const isExtOk = allowedExts.some((ext) => file.originalname.toLowerCase().endsWith(ext));

    if (isMimeOk || isExtOk) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and text documents are supported.'));
    }
  },
});
