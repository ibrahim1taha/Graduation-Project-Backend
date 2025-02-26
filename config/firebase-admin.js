const admin = require('firebase-admin');
const serviceAccount = require('../GradProj-firebase-admin.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (tokens, title, body, data) => {
	const message = {
		notification: { title, body },
		tokens: tokens, // Array of FCM tokens, 
		data: data
	};

	try {
		const response = await admin.messaging().sendEachForMulticast(message);
		console.log("Successfully sent message:", response);
	} catch (error) {
		console.log("Error sending message:", error);
	}
};

module.exports = sendNotification;

// sendToMultipleDevices(deviceTokens, "Hello Users!", "This is a notification for multiple users.");
