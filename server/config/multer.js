import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

export default upload;
