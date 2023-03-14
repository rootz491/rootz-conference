import { socket } from "./socket";

export const socketEvents = ({ setValue }) => {
	socket.on("test", (data) => {
		console.log("test event received", data);
		setValue((prev) => ({
			...prev,
			test: data,
		}));
	});

	socket.on("room-created", (room) => {
		setValue((prev) => ({
			...prev,
			rooms: [...(prev?.rooms ?? []), room],
		}));
	});

	socket.on("room-joined", async (room) => {
		console.log("room joined", room);
		setValue((prev) => ({
			...prev,
			latestRoom: room,
			// rooms: [...(prev?.rooms ?? []), room],
		}));
	});

	socket.on("receive-ice-candidate", async (incomingIceCandidate) => {
		console.log("ice candidate received", incomingIceCandidate);
		setValue((prev) => ({
			...prev,
			latestRoom: {
				...prev.latestRoom,
				iceCandidates: [...(prev?.iceCandidates ?? []), incomingIceCandidate],
			},
		}));
	});
};
