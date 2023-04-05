import { socket } from "./socket";

export const socketEvents = ({ setValue }) => {
	socket.on("test-server", (data) => {
		console.log("test event received", data);
		setValue((prev) => ({
			...prev,
			test: data,
		}));
	});

	socket.on("available", (data) => {
		console.log("someone became active", data);
		setValue((prev) => ({
			...prev,
			availableUser: data,
		}));
	});

	socket.on("me", (data) => {
		console.log("current user's info", data);
		setValue((prev) => ({
			...prev,
			me: data,
		}));
	});

	socket.on("call", (data) => {
		console.log("call received", data);
		setValue((prev) => ({
			...prev,
			call: data,
		}));
	});

	socket.on("accept-call", (data) => {
		console.log("call accepted", data);
		setValue((prev) => ({
			...prev,
			call: data,
		}));
	});
};
