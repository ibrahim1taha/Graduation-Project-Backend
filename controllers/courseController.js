const courseModel = require("../models/courses");
const sessionsModel = require("../models/sessions");
const userModel = require("../models/users");
const groupsModel = require("../models/groups");
const messagesModel = require("../models/messages");
const customErr = require("../utils/customErr");
const path = require("path");
const CourseServices = require("../services/courseServices");
const GroupServices = require("../services/groupsChatServices");
const mongoose = require("mongoose");
const isAuth = require("../middlewares/isAuth");
const awsFileHandler = require("../utils/awsFileHandler");

const io = require("../sockets/socket").getIo();

const defaultImageUrl =
    "https://grad-proj-images.s3.eu-north-1.amazonaws.com/uploads/defaultImage.png";

const courseController = {
    // add course by instructor endPoint
    addCourse: async (req, res, next) => {
        const session = await mongoose.startSession();
        // session.startTransaction();
        try {
            await session.withTransaction(async () => {
                CourseServices.validateRequest(req); // send error as array 422
                let imageURl = defaultImageUrl;
                const { title, price, description, topic, level, sessions } =
                    req.body;

                const course = new courseModel({
                    image: "",
                    title: title,
                    price: price,
                    description: description,
                    topic: topic,
                    level: level,
                    instructor: req.userId,
                    sessionsCount: sessions.length,
                });

                if (req.file)
                    imageURl = await awsFileHandler.handleFileUploaded(
                        req.file,
                        "uploads",
                        800,
                        450
                    );

                course.image = imageURl;
                // use promise all
                // create chat group for this course
                const courseChatGroup = new groupsModel({
                    groupImage: imageURl,
                    groupName: title,
                    course: course._id,
                    instructor: req.userId,
                    traineeCount: course.enrollmentCount,
                });

                course.chatGroupId = courseChatGroup._id;

                await Promise.all([
                    CourseServices.createSessions(
                        course._id,
                        sessions,
                        session
                    ),
                    courseChatGroup.save({ session }),
                    course.save({ session }),
                ]);

                res.status(201).json({
                    message: `course created successfully with ${
                        sessions?.length || 0
                    } session added`,
                    courseId: course._id,
                    groupChatId: courseChatGroup._id,
                });
            });
        } catch (err) {
            console.log(err);
            next(err);
        } finally {
            session.endSession();
        }
    },

    updateCourse: async (req, res, next) => {
        const session = await mongoose.startSession();
        const courseId = req.params.id;
        try {
            await session.withTransaction(async () => {
                CourseServices.validateRequest(req);
                CourseServices.validateObjectId(courseId);

                let course = await courseModel
                    .findById(courseId)
                    .session(session);
                let theGroupOfThisCourse = await groupsModel.findOne({
                    course: courseId,
                });

                if (!course || !theGroupOfThisCourse)
                    customErr(
                        404,
                        "The course not found or course group not found!"
                    );
                // check if has access to update (the course maker )
                isAuth.isHaveAccess(course.instructor, req.userId);

                const { title, price, topic, level, description, sessions } =
                    req.body;

                course.title = title;
                course.price = price;
                course.topic = topic;
                course.level = level;
                course.description = description;

                theGroupOfThisCourse.groupName = title;

                const bulkRes = await CourseServices.putSessions(
                    course._id,
                    sessions,
                    session
                );

                course.sessionsCount =
                    bulkRes.insertedCount + bulkRes.updatedCount;

                if (req.file) {
                    if (course.image != defaultImageUrl)
                        await awsFileHandler.deleteImageFromS3(course.image);

                    const updatedImg = await awsFileHandler.handleFileUploaded(
                        req.file,
                        "uploads",
                        800,
                        450
                    );
                    course.image = updatedImg;
                    theGroupOfThisCourse.groupImage = updatedImg;
                }

                await Promise.all([
                    course.save({ session }),
                    theGroupOfThisCourse.save({ session }),
                ]);

                res.status(201).json({
                    status: 200,
                    message: `Course updated successfully with sessions status: (${bulkRes.updatedCount} Updated - ${bulkRes.insertedCount} added - ${bulkRes.deletedCount} deleted)`,
                });
            });
        } catch (err) {
            console.log(err);
            next(err);
        } finally {
            session.endSession();
        }
    },

    deleteCourses: async (req, res, next) => {
        const id = req.params.id;
        console.log(id);
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                CourseServices.validateObjectId(id);

                const course = await courseModel.findByIdAndDelete(
                    { _id: id },
                    { session: session }
                );
                const theGroupOfThisCourse = await groupsModel.findOne({
                    course: id,
                });

                if (!course) customErr(404, "Course not found!");

                isAuth.isHaveAccess(course.instructor, req.userId);

                if (course.image != defaultImageUrl)
                    await awsFileHandler.deleteImageFromS3(course.image);

                const deleteGroupPromise = theGroupOfThisCourse?.deleteOne({
                    session,
                });
                const deleteGroupChatPromise = theGroupOfThisCourse
                    ? GroupServices.delGroupChat(
                          theGroupOfThisCourse._id,
                          session
                      )
                    : null;

                await Promise.all(
                    [
                        deleteGroupPromise,
                        CourseServices.deleteCourseSessions(
                            course._id,
                            session
                        ),
                        deleteGroupChatPromise,
                    ].filter(Boolean)
                ); // filter out null or undefined

                res.status(200).json({
                    message: "course deleted successfully",
                });
            });
        } catch (err) {
            console.log(err);
            next(err);
        } finally {
            session.endSession();
        }
    },

    getHomeData: async (req, res, next) => {
        try {
            const homeData = await CourseServices.getHomeDatePipelines();
            if (!homeData) customErr(404, "No courses found!");
            res.status(200).json(homeData[0]);
        } catch (err) {
            next(err);
        }
    },

    getCourseDetails: async (req, res, next) => {
        const courseId = req.params.courseId;
        try {
            if (!courseId) customErr(422, "Course id is required!");
            CourseServices.validateObjectId(courseId);

            const course = await CourseServices.getOneCourseDetails(courseId);
            // find if user joined the course or not or he is the instructor
            if (!req.userId)
                return res.status(200).json({ access: "public", course });

            const user = await userModel.findById(req.userId);

            if (user._id.equals(course.instructor._id))
                return res.status(200).json({ access: "instructor", course });

            const isJoined = user.myLearningIds.some(
                (doc) => doc.courseId.toString() === courseId
            );

            if (isJoined)
                return res.status(200).json({ access: "trainee", course });

            res.status(200).json({ access: "public", course });
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    getTopicCourses: async (req, res, next) => {
        try {
            const topic = req.params.topic;
            const page = req.query.page || 0;
            const courses = await CourseServices.getCourses(
                { topic: topic },
                { enrollmentCount: -1, createdAt: -1 },
                16 * page, // skip 16 course
                16 // take only 16 course
            );

            res.status(200).json(courses);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    getMyCourses: async (req, res, next) => {
        try {
            const courses = await courseModel
                .find(
                    { instructor: req.userId },
                    { trainees: 0, sessions: 0, updatedAt: 0 }
                )
                .sort({ createdAt: -1 });

            if (!courses) customErr(404, "Not found!");

            res.status(200).json(courses);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    getMyLearning: async (req, res, next) => {
        try {
            const courses = await CourseServices.getJoinedCoursesPipelines(
                req.userId
            );
            if (!courses) customErr(404, "Not found!");

            res.status(200).json(courses);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    joinCourse: async (req, res, next) => {
        const courseId = req.params.courseId;
        const { courseCode } = req.body;
        try {
            if (!courseId || !courseCode)
                customErr(400, "Course ID and course code are required.");

            const [user, course, group] = await Promise.all([
                userModel.findById(req.userId).exec(),
                courseModel.findById(courseId).exec(),
                groupsModel.findOne({ course: courseId }).exec(),
            ]);

            if (!user) customErr(404, "user not found! ");
            if (!course) customErr(404, "course not found!");

            if (course.courseCode !== courseCode)
                customErr(422, "invalid code!");

            const isJoined = user.myLearningIds.some(
                (doc) => doc.courseId && doc.courseId.toString() === courseId
            );
            if (isJoined) customErr(422, "You are already joined the course!");
            console.log(course.chatGroupId);
            user.myLearningIds.push({
                courseId: course._id,
                courseChatGroupId: course.chatGroupId,
            });
            course.enrollmentCount += 1;
            group.traineeCount += 1;
            await Promise.all([user.save(), course.save(), group.save()]);

            res.status(201).json({
                message:
                    "Congratulations, you have successfully joined the course!",
                courseId: course._id,
                groupChatId: group._id,
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    searchCourses: async (req, res, next) => {
        let { search } = req.body;
        const socketId = req.headers["socket-id"];
        try {
            const [users, courses] = await Promise.all([
                userModel.aggregate(CourseServices.userSearchPipelines(search)),
                courseModel.aggregate(
                    CourseServices.courseSearchPipeline(search)
                ),
            ]);

            if (!users || !courses) customErr(404, "Not found!");

            const searchResult = users.concat(courses);

            io.to(socketId).emit("search", { searchResult });
            res.status(200).json(searchResult);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = courseController;
