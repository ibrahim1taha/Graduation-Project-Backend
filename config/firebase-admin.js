const admin = require('firebase-admin');
const serviceAccount = require('../GradProj-firebase-admin.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (groupId, senderName, title, text, data) => {
	const body = `${senderName}: ${text}`;
	const message = {
		notification: { title, body },
		topic: groupId,
		data: data
	};

	try {
		const response = await admin.messaging().send(message);
		console.log("Successfully sent message:", response);
	} catch (error) {
		console.log("Error sending message:", error);
	}
};

module.exports = sendNotification;

// sendToMultipleDevices(deviceTokens, "Hello Users!", "This is a notification for multiple users.");
