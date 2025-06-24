const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
	const allowedType = ['image/jpeg', 'image/png', 'image/jpg' , 'audio/mpeg' , 'audio/aac'];
	(allowedType.includes(file.mimetype)) ? cb(null, true) : cb(null, 'Invalid file type , Only JPEG , PNG , JPG');
}

module.exports = multer({ storage: storage, fileFilter: fileFilter })