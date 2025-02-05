const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');
const mongoose = require('mongoose');
const s3 = require('../config/s3Configuration');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

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

		await s3.send(new PutObjectCommand(params));
		return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`;
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

	static async createSessions(courseId, sessions) {
		try {
			// console.log(courseId + " ||||| " + sessions);
			// sessions = await JSON.parse(sessions);
			if (!Array.isArray(sessions) || sessions.length === 0) {
				return;
			}
			const sessionsPromises = sessions.map(session => {
				sessionsModel.create({ courseId: courseId, title: session.title, startDate: session.startDate })
			})
			await Promise.all(sessionsPromises);
			console.log(courseId + " ||||| " + sessions[0].title);
		} catch (err) {
			throw new Error("Failed to add session!")
		}
	}

	static async deleteCourseSessions(courseId) {
		try {
			this.validateObjectId(courseId);

			await sessionsModel.deleteMany({ courseId: courseId });

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