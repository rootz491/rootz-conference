import React, { useEffect, useState } from "react";
import TestSocket from "../components/testSocket";
import { useSocket } from "../contexts/socket";
import { useWebRTC } from "../contexts/webRTC";

function App() {
	const { createRoom, joinRoom, openUserMedia } = useWebRTC();
	const { value } = useSocket();

	const localVideoRef = React.useRef();
	const remoteVideoRef = React.useRef();

	useEffect(() => {
		openUserMedia(localVideoRef.current, remoteVideoRef.current);
	}, [value]);

	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: "20px",
					alignItems: "center",
				}}
			>
				<h4>Who Am I?</h4>
				<p>
					{JSON.parse(atob(localStorage.getItem("token").split(".")[1]))?.id}
				</p>
			</div>

			<h1>Rootz Conference</h1>
			<TestSocket />

			<div>
				<p>Make a call?</p>
				<button onClick={createRoom}>call</button>
			</div>

			<hr />

			<div>
				<h4>Your Room</h4>
				{value?.latestRoom?.roomId ? (
					<div>
						<p>Room ID: {value.latestRoom.roomId}</p>
						<p>Owner ID: {value.latestRoom?.owner.userId}</p>
						<p>
							Joinee ID:{" "}
							{value.latestRoom?.joinee?.userId ?? "Haven't joined yet!"}
						</p>

						<p>{value.latestRoom?.offer && "Room has offer"}</p>
						<p>{value.latestRoom?.answer && "Room has answer"}</p>
					</div>
				) : (
					<p>No room</p>
				)}

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<div>
						<h4>Local Video</h4>
						<video
							style={{
								width: "300px",
								height: "300px",
								flex: 1,
								border: "1px solid black",
							}}
							id="localVideo"
							ref={localVideoRef}
							autoPlay={true}
							playsInline={true}
						></video>
					</div>
					<div>
						<h4>Remote Video</h4>
						<video
							style={{
								width: "300px",
								height: "300px",
								flex: 1,
								border: "1px solid black",
							}}
							id="remoteVideo"
							ref={remoteVideoRef}
							autoPlay={true}
							playsInline={true}
						></video>
					</div>
				</div>
			</div>

			<hr />

			<div>
				<h4>Rooms List</h4>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: "1rem",
					}}
				>
					{value?.rooms?.length > 0 ? (
						value.rooms // remove duplicate rooms (same roomId)
							?.filter(
								(room, index, self) =>
									index === self.findIndex((t) => t.roomId === room.roomId)
							)
							?.map((room) => (
								<div
									key={Math.random() * 1000}
									style={{
										border: "1px solid black",
										padding: "1rem",
									}}
								>
									<p>Room ID: {room.roomId}</p>
									<p>Owner ID: {room?.owner?.userId}</p>
									{room?.joinee && <p>Joinee ID: {room?.joinee?.userId}</p>}

									<p>{room?.offer && "Room has been created (Offer)"}</p>
									<p>
										{room?.answer && "Room has been joined by someone (Answer)"}
									</p>
									<button
										disabled={room?.joinee != null}
										onClick={() => {
											console.log("joining room", room.roomId);
											joinRoom(room);
										}}
									>
										Join
									</button>
								</div>
							))
					) : (
						<p>No rooms</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
