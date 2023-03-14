import React from "react";
import CallMenu from "./components/callMenu";
import VideoPlayer from "./components/videoPlayer";

function SimplePeerClient() {
	return (
		<div>
			<CallMenu>
				<VideoPlayer />
			</CallMenu>
		</div>
	);
}

export default SimplePeerClient;
