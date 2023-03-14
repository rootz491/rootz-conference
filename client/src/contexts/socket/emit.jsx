import { socket } from "./socket";

export const testEmit = () => {
	socket.emit("test", "Hello World");
};

// Client side emit
export const callUser = (offer) => {
	socket.emit("create-room", offer);
};

export const answerMade = (answer) => {
	socket.emit("join-room", answer);
};

export const sendIceCandidate = (candidate) => {
	socket.emit("send-ice-candidate", candidate);
};
//  any component can import test() and call it to emit a test event
