// const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');


const AWS_ACCESS_KEY_ID = 'AKIAYWBJYUT3SLNUWNVK';
const AWS_SECRET_ACCESS_KEY = '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';
const AWS_REGION = 'eu-north-1';

const s3Config = {
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
	region: AWS_REGION,
}

const s3 = new S3Client(s3Config);

module.exports = s3; 