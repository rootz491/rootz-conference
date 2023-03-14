import React from "react";
import ReactDOM from "react-dom/client";
import App from "./First";
import WebRTCClient from "./WebRTCClient";
import SocketProvider from "./contexts/socket";
import WebRTCProvider from "./contexts/webRTC";
import CallMenu from "./components/callMenu";
import VideoPlayer from "./components/videoPlayer";
import SimplePeerClient from "./simplePeerClient";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		{/* <SocketProvider> */}
		{/* <WebRTCProvider> */}
		{/* <App /> */}
		<WebRTCClient />
		{/* <SimplePeerClient /> */}
		{/* </WebRTCProvider>
		</SocketProvider> */}
	</React.StrictMode>
);
