const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const storage = multer.memoryStorage();
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, './public/images')
// 	},

// 	filename: (req, file, cb) => {
// 		cb(null, uuidv4() + '-' + file.originalname);
// 	}
// })

const fileFilter = (req, file, cb) => {
	const allowedType = ['image/jpeg', 'image/png', 'image/jpg'];
	(allowedType.includes(file.mimetype)) ? cb(null, true) : cb(null, 'Invalid file type , Only JPEG , PNG , JPG');
}

module.exports = multer({ storage: storage, fileFilter: fileFilter })