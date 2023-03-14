import React, { useContext } from "react";
import { SocketContext } from "../contexts/simplePeer";

function CallMenu({ children }) {
	const { me, callAccepted, name, setName, callEnded, leaveCall, callUser } =
		useContext(SocketContext);
	const [idToCall, setIdToCall] = useState("");

	return (
		<>
			<div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						gap: "2em",
					}}
				>
					<div
						style={{
							display: "grid",
							gap: "1em",
							border: "1px solid black",
						}}
					>
						<h6>Account Info</h6>
						<textarea value={name} onChange={(e) => setName(e.target.value)} />
						<div>Your ID: {me}</div>
					</div>
					<div
						style={{
							display: "grid",
							gap: "1em",
							border: "1px solid black",
						}}
					>
						<h6>Make a call</h6>
						<textarea
							value={idToCall}
							onChange={(e) => setIdToCall(e.target.value)}
						/>
						{callAccepted && !callEnded ? (
							<button onClick={leaveCall}>Hang Up</button>
						) : (
							<button onClick={() => callUser(idToCall)}>Call</button>
						)}
					</div>
				</div>
				{children}
			</div>
		</>
	);
}

export default CallMenu;
