const sharp = require('sharp');
const customErr = require('./customErr');

const sharpImage = async (imageBuffer, width, height) => {
	const fileBuffer = await sharp(imageBuffer)
		.resize({
			width: width, // Define the width
			height: height, // Let sharp auto-calculate height to maintain aspect ratio
			fit: 'cover',
			position: 'center',
			withoutEnlargement: true,
		})
		.jpeg({ quality: 80, mozjpeg: true })
		.toBuffer();

	return fileBuffer;
}

module.exports = sharpImage; 