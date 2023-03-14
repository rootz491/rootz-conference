import io from "socket.io-client";
import { socketEvents } from "./events";

export const socket = io("http://localhost:8000" ?? import.meta.env.BACKEND_URL, {
	extraHeaders: {
		Authorization: `Bearer ${localStorage.getItem("token")}`,
	},
});

export const initSockets = ({ setValue }) => {
	socketEvents({ setValue });
};
