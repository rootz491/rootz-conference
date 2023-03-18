const { isSocketAuthenticated } = require("./middleware");
const { v4: uuidv4 } = require("uuid");
const { users } = require("./auth.routes");

const sockets = [];

const webRTCRooms = [];

const init = (io) => {
	try {
		io.use(isSocketAuthenticated).on("connection", (socket) => {
			try {
				console.log("New client connected", socket.id);

				if (socket?.userInfo?.id == null) throw new Error("User id not found");
				sockets.push({
					socketId: socket.id,
					userId: socket?.userInfo?.id,
				});

				// when someone becomes active, emit to his socket about his active status
				socket.emit("me", {
					socketId: socket.id,
					userId: socket?.userInfo?.id,
					username:
						users.find((user) => user.id === socket?.userInfo?.id)?.username ??
						"Unknown",
				});

				//	when someone becomes available, broadcast to all users
				socket.broadcast.emit("available", {
					socketId: socket.id,
					userId: socket?.userInfo?.id,
					username:
						users.find((user) => user.id === socket?.userInfo?.id)?.username ??
						"Unknown",
				});

				//	Test event
				socket.on("test-client", () => {
					console.log("Test event received");
					socket.emit("test-server", "Hello from server");
				});

				//	Transfer call "data" to another user
				socket.on("call", (data) => {
					console.log("Call event received");
					if (data?.meta?.callee?.socketId == null) {
						console.log("Callee socket id not found");
						return;
					}
					socket.to(data.meta.callee.socketId).emit("call", data);
				});

				socket.on("accept-call", (data) => {
					console.log("accept-Call event received");
					if (data?.meta?.caller?.socketId == null) {
						console.log("caller socket id not found");
						return;
					}
					socket.to(data.meta.caller.socketId).emit("accept-call", data);
				});

				socket.on("disconnect", () => {
					console.log("Client disconnected");
					sockets.splice(
						sockets.findIndex(
							(connection) => connection.socketId === socket.id
						),
						1
					);
				});
			} catch (error) {
				console.log(error);
				socket.disconnect(true);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	init,
	sockets,
	webRTCRooms,
};
