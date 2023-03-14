import { useContext } from "react";
import { SocketContext } from "../contexts/simplePeer";

const VideoPlayer = () => {
	const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } =
		useContext(SocketContext);

	return (
		<div
			style={{
				display: "grid",
				gap: "2em",
			}}
		>
			{stream && (
				<div>
					<h5>{name || "Name"}</h5>
					<video playsInline muted ref={myVideo} autoPlay />
				</div>
			)}
			{callAccepted && !callEnded && (
				<div>
					<h5>{call.name || "Name"}</h5>
					<video playsInline ref={userVideo} autoPlay />
				</div>
			)}
		</div>
	);
};

export default VideoPlayer;
