// const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');


const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;

const s3Config = {
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
	region: AWS_REGION,
}

const s3 = new S3Client(s3Config);

module.exports = s3; 