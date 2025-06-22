const socket = require("./socket");

const liveSessionController = require("../controllers/liveSessionController");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`${socket.id} connected`);

        // join chat groups room take array of groups IDs
        socket.on("joinGroupsRooms", (data) => {
            socket.join(data.groupsId);
            io.to(data.groupsId).emit("user-joined-group-chat", {
                message: "user joined the group chat",
            });
            console.log(data.groupsId);
        });
        // general room joining. // used in join course details 
        socket.on("joinRoom", (key) => {
            socket.join(key);
            console.log(key + " joined room");
        });

        socket.on("leaveGroupsRooms", (data) => {
            socket.leave(data.groupsId);
            io.to(data.groupsId).emit("user-leaved-group-chat", {
                message: "user leaved the group chat",
            });
            console.log(`${socket.id} leaved room: ${data.groupsId}`);
        });

        /////////////////////////live session///////////////////////

        socket.on("join-session-room", async ({ sessionId, userId }) => {
            socket.join(sessionId);
            await liveSessionController.joinLiveSession(
                sessionId,
                userId,
                socket,
                io
            ); //include emit ->  user-connected , existing-users
        });

        socket.on("media-control", (data) => {
            socket.to(data.sessionId).emit("media-control", data);
        });

        socket.on("offer", (data) => {
            io.to(data.sessionId).emit("offer", data);
        });

        socket.on("ice-candidate", (data) => {
            socket.to(data.sessionId).emit("ice-candidate", data);
        });

        socket.on("answer", (data) => {
            io.to(data.sessionId).emit("answer", data);
        });

        socket.on("end-live-session", async ({ sessionId, userId, role }) => {
            socket.leave(sessionId);
            await liveSessionController.leaveLiveSession(
                sessionId,
                userId,
                socket,
                role,
            );
        });

        // [for instructor] end session and convert it to the summary button
		// this socket will replaced with endAndSummarize end point.
        // socket.on(
        //     "instructor-end-liveSession",
        //     async ({ sessionId, userId }) => {
        //         socket.leave(sessionId);
        //         await liveSessionController.leaveLiveSession(
        //             sessionId,
        //             userId,
        //             socket,
        //             "instructor-end-liveSession",
        //             "",
        //             io
        //         );
        //     }
        // );
        ///////////////////////

        socket.on("disconnect", () => {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
            console.log(`${socket.id} disconnected and left all rooms`);
        });
    });
};
