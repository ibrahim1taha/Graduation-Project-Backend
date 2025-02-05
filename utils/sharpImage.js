const sharp = require('sharp');
const customErr = require('./customErr');

const sharpImage = async (imageBuffer, width, height) => {
	const fileBuffer = await sharp(imageBuffer)
		.resize(width, height, {
			fit: 'cover',
			position: 'center',
			withoutEnlargement: true,
		})
		.jpeg({ quality: 80, mozjpeg: true })
		.toBuffer();

	return fileBuffer;
}

module.exports = sharpImage; 