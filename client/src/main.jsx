import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Home";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		{/* <SocketProvider> */}
		{/* <WebRTCProvider> */}
		<Home />
		{/* </WebRTCProvider>
		</SocketProvider> */}
	</React.StrictMode>
);
