const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const customErr = require("../utils/customErr");
const userModel = require("../models/users");

const authorized = async (req, res, next) => {
    try {
        const auth = req.get("Authorization");
        if (!auth?.startsWith("Bearer ")) {
            customErr(401, "Unauthorized");
        }
        const token = auth.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken?.userId) customErr(401, "Not authorized!");
        const userId = new ObjectId(decodedToken.userId);
        const user = await userModel.findById(userId);
        if (!user) customErr(404, "User not found!");
        req.userId = userId;
        req.userRole = decodedToken.role;
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const isInstructor = (req, res, next) => {
    if (req.userRole !== "instructor")
        customErr(401, "Not authorized for this action!");
    next();
};

const isHaveAccess = (realUserId, userId) => {
    if (realUserId.toString() != userId.toString())
        customErr(
            404,
            "(Not Authorized): You do not have access to do this action"
        );
};
// check if this token belongs to this user or not
const authorizedOrNot = (req, res, next) => {
    // get token from header with the name of Authorization
    const token = req.get("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
        req.userId = null;
        return next();
    }
    authorized(req, res, next);
};
module.exports = { authorized, isInstructor, isHaveAccess, authorizedOrNot };
