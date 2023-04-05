import { socket } from "./socket";

export const testEmit = () => {
	socket.emit("test-client");
};

export const callEmit = (data) => {
	socket.emit("call", data);
};

export const acceptCallEmit = (data) => {
	socket.emit("accept-call", data);
};

//  any component can import test() and call it to emit a test event
