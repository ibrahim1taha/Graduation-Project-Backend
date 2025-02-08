const fs = require('fs');
const path = require('path');
const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');
const mongoose = require('mongoose');
const s3 = require('../config/s3Configuration');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const courseDocIgnoredItems = {
	trainees: 0, sessions: 0, _id: 0, createdAt: 0
	, updatedAt: 0, enrollmentCount: 0, courseCode: 0
}

class CourseServices {

	static validateRequest(req) {
		const validationErr = validationResult(req).array();
		if (validationErr.length > 0) customErr(422, validationErr);
	}

	static validateObjectId(id) {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			customErr(422, 'ID not Valid!')
		}
	};

	static async handleFileUploaded(fileBuffer, fileName, mimeType) {
		try {
			const S3_BUCKET_NAME = 'grad-proj-images'
			const AWS_REGION = 'eu-north-1';
			const format = mimeType.split('/')[1];

			const params = {
				Bucket: S3_BUCKET_NAME,
				Key: `uploads/${Date.now()}.${format}`, // Store in 'uploads/' folder in S3
				Body: fileBuffer,
				ContentType: mimeType,
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
			throw new Error('Something went wrong while uploading the image')
		}

	}


	static async deleteImageFromS3(key) {
		const S3_BUCKET_NAME = 'grad-proj-images'
		if (!key) {
			throw new Error('Invalid or missing S3 object key');
		}

		const url = new URL(key);
		const Key = url.pathname.substring(1);

		try {
			const params = {
				Bucket: S3_BUCKET_NAME,
				Key: Key
			}

			const command = new DeleteObjectCommand(params);

			await s3.send(command);
		} catch (err) {
			throw new Error(`Error deleting object from S3`);
		}
	}

	static async createSessions(courseId, sessions, session) {
		try {

			if (!Array.isArray(sessions) || sessions.length === 0) {
				return;
			}

			const sessionsData = sessions.map(sessionDoc => ({
				courseId: courseId
				, title: sessionDoc.title,
				startDate: sessionDoc.startDate
			}));

			await sessionsModel.insertMany(sessionsData, { session });

		} catch (err) {
			throw new Error("Failed to add session!")
		}
	}
	// create or update session on update course endpoint 
	static async putSessions(courseId, sessions, transactionsSession) {
		try {
			if (!Array.isArray(sessions)) {
				return { updatedCount: 0, insertedCount: 0, deletedCount: 0 };
			}

			const existingCourseSessions = await sessionsModel.find({ courseId: courseId });

			const updatedSessions = [];

			const updatedSessionsArr = sessions.map(session => {
				if (session._id) {
					updatedSessions.push(session._id);
					return {
						updateOne: {
							filter: { _id: session._id },
							update: { title: session.title, startDate: session.startDate }
						}
					}
				} else {
					return {
						insertOne: {
							document: { courseId: courseId, ...session }
						}
					};
				}
			})

			const bulkRes = await sessionsModel.bulkWrite(updatedSessionsArr, { session: transactionsSession });

			const sessionsToDelete = existingCourseSessions.filter(
				session => !updatedSessions.includes(session._id.toString()
				)).map(session =>
					session._id.toString()
				);

			if (sessionsToDelete.length > 0)
				await sessionsModel.deleteMany({ _id: { $in: sessionsToDelete } }, { session: transactionsSession });

			return { updatedCount: bulkRes.modifiedCount, insertedCount: bulkRes.insertedCount, deletedCount: sessionsToDelete.length }
		} catch (err) {
			console.log(err);
			throw new Error("Failed to update sessions!")
		}
	}

	static async deleteCourseSessions(courseId, session) {
		try {
			this.validateObjectId(courseId);

			await sessionsModel.deleteMany({ courseId: courseId }, { session: session });

		} catch (err) {
			throw new Error('Something went wrong while deleting sessions!');
		}
	}

	static async getCourses(query, sortOption, limit) {
		const Courses = await courseModel.find(query, courseDocIgnoredItems)
			.populate('instructor', 'userPhoto userName')
			.sort(sortOption)
			.limit(limit);
		if (!Courses || Courses.length === 0) customErr(404, 'something went wrong , no courses found!');
		return Courses;
	}


	static async getCoursesGroupedByTopic() {
		const topics = await courseModel.aggregate()
			.sort({ enrollmentCount: -1, createdAt: -1 })
			.lookup({
				from: 'users',
				localField: 'instructor',
				foreignField: "_id",
				as: "instructor"
			})
			.unwind("instructor")
			.project({
				image: 1, title: 1, price: 1, topic: 1, level: 1,
				instructor: {
					userPhoto: "$instructor.userPhoto",
					userName: "$instructor.userName"
				}
			})
			.group({
				_id: "$topic",
				courses: {
					$push: {
						image: "$image", title: "$title", price: "$price",
						topic: "$topic", level: "$level", instructor: "$instructor"
					},
				}
			}).project({
				_id: 0,
				category: "$_id",
				courses: { $slice: ["$courses", 5] }
			})
		return topics
	}

	static async getHomeDatePipelines() {
		const homeData = await courseModel.aggregate().lookup({
			from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor'
		}).unwind("instructor")
			.project({
				image: 1, title: 1, price: 1, topic: 1, level: 1, enrollmentCount: 1, createdAt: 1,
				instructor: {
					userPhoto: "$instructor.userPhoto",
					userName: "$instructor.userName"
				}
			}).facet({
				mostPopular: [
					{ $sort: { enrollmentCount: -1 } },
					{ $limit: 5 },
				],
				mostNew: [
					{ $sort: { createdAt: -1 } },
					{ $limit: 5 }
				],
				categories: [
					{ $sort: { enrollmentCount: -1, createdAt: -1 } },
					{
						$group: {
							_id: "$topic",
							courses: {
								$push: {
									_id: "$_id", image: "$image", title: "$title", price: "$price",
									topic: "$topic", level: "$level",
									instructor: "$instructor", enrollmentCount: "$enrollmentCount"
								}
							}
						}
					},
					{
						$project: {
							_id: 0,
							topic: "$_id",
							courses: { $slice: ["$courses", 5] }
						}
					},
				]
			})
		return homeData;
	}


}


module.exports = CourseServices; 