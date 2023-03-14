const { isSocketAuthenticated } = require("./middleware");
const { v4: uuidv4 } = require("uuid");

const sockets = [];

const webRTCRooms = [];

const init = (io) => {
	try {
		// io.use(isSocketAuthenticated).on("connection", (socket) => {
		io.on("connection", (socket) => {
			// /*
			try {
				console.log("New client connected", socket.id);

				if (socket?.userInfo?.id == null) throw new Error("User id not found");
				sockets.push({
					socketId: socket.id,
					userId: socket?.userInfo?.id,
				});

				socket.on("test", (data) => {
					console.log(data);
					socket.emit("test", "Hello from server!");
				});

				// WebRTC events

				socket.on("create-room", (roomWithOffer) => {
					console.log("create-room");
					// create a new room with a unique id
					webRTCRooms.push({
						roomId: uuidv4(),
						owner: {
							userId: socket?.userInfo?.id,
							socketId: socket.id,
						},
						...roomWithOffer,
					});

					// send the room to all clients except the one that created it
					socket.broadcast.emit(
						"room-created",
						webRTCRooms[webRTCRooms.length - 1]
					);
				});

				socket.on("join-room", (roomWithAnswer) => {
					// console.log("join-room", roomWithAnswer);
					// find the room with the given id
					const room = webRTCRooms.findIndex(
						(room) => room.roomId === roomWithAnswer?.roomId
					);

					const updatedRoom = {
						...webRTCRooms[room],
						...roomWithAnswer,
						joinee: {
							userId: socket?.userInfo?.id,
							socketId: socket.id,
						},
					};

					// if the room exists, update the room with the answer
					if (room !== -1) {
						//	remove the room with duplicate id from array
						webRTCRooms.splice(
							webRTCRooms.findIndex(
								(room) => room.roomId === roomWithAnswer?.roomId
							),
							1
						);

						// add the updated room to the array
						webRTCRooms.push(updatedRoom);

						// notify owner that the room is ready
						socket
							.to(roomWithAnswer?.owner?.socketId)
							.emit("room-joined", updatedRoom);

						// notify joinee that the room is ready
						socket.emit("room-joined", updatedRoom);
					}
				});

				//	send ice candidate from joinee to owner
				socket.on("send-ice-candidate", (candidateData) => {
					const ownerSocketId = candidateData?.ownerSocketId;

					socket
						.to(ownerSocketId)
						.emit("receive-ice-candidate", candidateData?.candidate);
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
			// */

			// socket.emit("me", socket.id);

			// socket.on("callUser", ({ userToCall, signalData, from, name }) => {
			// 	io.to(userToCall).emit("callUser", {
			// 		signal: signalData,
			// 		from,
			// 		name,
			// 	});
			// });

			// socket.on("answerCall", (data) => {
			// 	io.to(data.to).emit("callAccepted", data.signal);
			// });

			// socket.on("disconnect", () => {
			// 	socket.broadcast.emit("callEnded");
			// });
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
