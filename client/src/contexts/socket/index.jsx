// SocketContext.js
import React, { useContext, createContext, useState, useEffect } from "react";
import { initSockets } from "./socket";

const SocketContext = createContext({});

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
	const [value, setValue] = useState({});

	//	When the component mounts, initialize the socket
	useEffect(() => initSockets({ setValue }), [initSockets]);

	// When server emits notification event, get the notification data
	useEffect(() => {
		if (Object.keys(value).length > 0) console.log("received new value", value);
	}, [value]);

	return (
		<SocketContext.Provider value={{ value, setValue }} >
			{children}
		</SocketContext.Provider>
	);
};

export { useSocket };
export default SocketProvider;
