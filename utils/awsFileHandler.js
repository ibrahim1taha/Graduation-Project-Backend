const s3 = require('../config/s3Configuration');
const { DeleteObjectCommand, DeleteObjectsCommand , GetObjectCommand  } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const customErr = require('../utils/customErr')
const sharpImage = require('../utils/sharpImage');
// should be in .env file 
const S3_BUCKET_NAME = 'grad-proj-images'
const AWS_REGION = 'eu-north-1';

const handleFileUploaded = async (type = 'image' , file, folderName, width, height) => {

	try {
		let bodyContent ; 
		let contentType  ; 
		let format ; 
		if(type === 'image'){
			if (file.size > (1024 * 1024)) customErr(422, 'Maximum image size is 1MB', 'image');
			// share image to 800 * 450 px 
			bodyContent = await sharpImage(file.buffer, width, height);
			contentType  = file.mimetype ; 
			format = file.mimetype.split('/')[1];
		}else{
			bodyContent = file ; 
			contentType  = 'text/plain', 
			format = 'txt'
		}

		const params = {
			Bucket: S3_BUCKET_NAME,
			Key: `${folderName}/${Date.now()}.${format}`,
			Body: bodyContent,
			ContentType: contentType ,
			ACL: "public-read",
		}

		const upload = new Upload({
			client: s3,
			params: params
		})

		await upload.done();
		// await s3.send(new PutObjectCommand(params));
		return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`;
	} catch (err) {
		console.log(err.message);
		throw err
	}

}


const deleteImageFromS3 = async (key) => {
	if (!key || key === 'undefined') {
		throw new Error('Invalid or missing S3 object key');
	}

	const url = new URL(key);
	const Key = url.pathname.substring(1);
	console.log(Key); 
	const params = {
		Bucket: S3_BUCKET_NAME,
		Key: Key
	}
	
	const command = new DeleteObjectCommand(params);
	
	await s3.send(command);
}	

const deleteImagesFromS3 = async (keysArr) => {

	if (!keysArr) {
		throw new Error('Invalid or missing S3 objects keys');
	}

	const params = {
		Bucket: S3_BUCKET_NAME,
		Delete: {
			Objects: keysArr // : {{ Key : Url} , {Key : Url}}
		},
		Quiet: true
	}

	const command = new DeleteObjectsCommand(params);
	await s3.send(command);
}


const getObjectFromS3 = async (contentUrl) => {

	if(!contentUrl)
		throw new Error('Invalid or missing S3 object key');

	const url = new URL(contentUrl);
	const key = url.pathname.substring(1);

	const params = {
		Bucket: S3_BUCKET_NAME,
		Key : key ,
	}

	const command = new GetObjectCommand(params); 

	const data = await s3.send(command); 

	const content = await data.Body.transformToString('utf-8') ;
	
	return content ; 

}

module.exports = { handleFileUploaded, deleteImageFromS3, deleteImagesFromS3 , getObjectFromS3 }