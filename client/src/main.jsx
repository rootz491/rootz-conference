import React from "react";
import ReactDOM from "react-dom/client";
import SocketProvider from "./contexts/socket";
import WebRTCClient from "./archive/WebRTCClient.clean";
import Home from "./Home";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<SocketProvider>
			<Home />
			{/* <WebRTCClient /> */}
		</SocketProvider>
	</React.StrictMode>
);
