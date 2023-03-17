// TODO remove comments with TESTING

// TODO When onAnswer is called, we need to send a message to receiver let them know that call has begin (change state of call to true) [via socket]
// TODO When hangup is called, we need to send a message to receiver or sender to let them know that call has ended (change state of call to false) [via socket]
import React, { useEffect } from "react";

const VideoPlayer = () => {
	const [peerConnection, setPeerConnection] = React.useState(null);
	const [inCall, setInCall] = React.useState(false);
	const [waitingForPeer, setWaitingForPeer] = React.useState(false);

	const localVideoRef = React.useRef(null);
	const remoteVideoRef = React.useRef(null);

	const [offer, setOffer] = React.useState(null);
	const [answer, setAnswer] = React.useState(null);

	useEffect(() => {
		createPeerConnection();
	}, []);

	const createPeerConnection = async () => {
		//	setup local streams
		const localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false,
		});

		//  Update video streams in the DOM
		localVideoRef.current.srcObject = localStream;

		//	create peer connection
		const pc = new RTCPeerConnection();
		registerPeerConnectionListeners(pc);

		// Create remote stream and add to video element
		const remoteStream = new MediaStream();
		remoteVideoRef.current.srcObject = remoteStream;

		//  Push tracks from local stream to peer connection
		if (localStream) {
			localStream.getTracks().forEach((track) => {
				pc.addTrack(track, localStream);
			});
		} else {
			throw new Error(
				"Local stream is not available, please check your camera and microphone"
			);
		}

		//  Pull tracks from remote stream, add to video stream in DOM
		if (remoteStream) {
			pc.ontrack = async (event) => {
				event.streams[0].getTracks().forEach((track) => {
					remoteStream.addTrack(track);
				});
			};
		} else {
			throw new Error(
				"Remote stream is not available, please check with your peer connection"
			);
		}

		setPeerConnection(pc);
	};

	const generateIceCandidate = async (peerType) => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				//  when ice candidate is received, we'll update the offer and answer sdp and then send it back to the caller and callee
				if (peerType === "caller") {
					setOffer(peerConnection?.localDescription);
				} else if (peerType === "receiver") {
					setAnswer(peerConnection?.localDescription);
				} else {
					throw new Error(
						"Peer type is not available, please look into generating ice candidate"
					);
				}
			}
		};
	};

	const hangup = async () => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		await peerConnection.close();
		setInCall(false);
		setOffer(null);
		setAnswer(null);

		createPeerConnection();
	};

	// CALLER SIDE, (offerer)

	const startCall = async () => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		await generateIceCandidate("caller");

		const offerDescription = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offerDescription);

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type,
		};

		// TODO store offer in database, ref to current user

		setOffer(offer);
	};

	// CALLEE SIDE, (answerer)

	// TODO call this function once offer is received from caller to calle and answer is created and sent back to caller
	const onAnswer = async (answer) => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		if (peerConnection.currentRemoteDescription) {
			console.log("Remote description already set");
			return;
		}

		const answerDescription = new RTCSessionDescription(answer);
		await peerConnection.setRemoteDescription(answerDescription);
		setInCall(true);
	};

	// ANSWERER SIDE, (answerer)

	const getCallOffer = async (callId) => {
		//  TODO get offer from database, ref to callId
		return JSON.parse(offer);
	};

	const answerCall = async (callId) => {
		//* get offer from database, ref to callId (offer contains ice candidates)
		//// get ice candidates from database, ref to callId
		//// set ice candidates to peer connection
		//* set offer to peer connection as remoteDescription
		//* create answer which is localDescription
		//* set answer to peer connection as localDescription
		//* store answer in database, ref to callId (to be used by caller to set remoteDescription)

		await generateIceCandidate("receiver");

		const offer = await getCallOffer(callId);
		const offerDescription = new RTCSessionDescription(offer);
		await peerConnection.setRemoteDescription(offerDescription);

		const answerDescription = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answerDescription);

		const answer = {
			sdp: answerDescription.sdp,
			type: answerDescription.type,
		};

		console.log("answer created", answer);
		// TODO store answer in database, ref to callId

		setAnswer(answer);
	};

	// DEBUG

	function registerPeerConnectionListeners(peerConnection) {
		peerConnection.addEventListener("icegatheringstatechange", () => {
			console.log(
				`ICE gathering state changed: ${peerConnection.iceGatheringState}`
			);
		});

		peerConnection.addEventListener("connectionstatechange", () => {
			console.log(`Connection state change: ${peerConnection.connectionState}`);

			// put below logic somewhere else
			switch (peerConnection.connectionState) {
				case "connecting":
					setWaitingForPeer(true);
					break;

				case "connected":
					setInCall(true);
					setWaitingForPeer(false);
					break;

				case "disconnected":
					peerConnection.close();
					setInCall(false);
					setOffer(null);
					setAnswer(null);

					createPeerConnection();
					break;
			}
		});

		peerConnection.addEventListener("signalingstatechange", () => {
			console.log(`Signaling state change: ${peerConnection.signalingState}`);
		});

		peerConnection.addEventListener("iceconnectionstatechange ", () => {
			console.log(
				`ICE connection state change: ${peerConnection.iceConnectionState}`
			);
		});
	}

	return (
		<div
			style={{
				display: "grid",
				gap: "2em",
			}}
		>
			<h1>{peerConnection?.connectionState ?? "no state"}</h1>

			{waitingForPeer && (
				<center>
					<h2> waiting for peer to respond... </h2>
				</center>
			)}

			<div
				style={{
					width: "100%",
					height: "600px",
					position: "relative",
				}}
			>
				<video
					style={{
						border: "1px solid black",
						width: "100%",
						height: "100%",
						background: "lightgray",
					}}
					ref={remoteVideoRef}
					autoPlay
					about="callee"
				></video>

				<div
					style={{
						width: "200px",
						height: "200px",
						position: "absolute",
						bottom: 35,
						right: 15,
					}}
				>
					<center>
						<strong style={{ margin: 0 }}>You</strong>
					</center>
					<video
						style={{
							border: "1px solid black",
							width: "200px",
							height: "200px",
							background: "lightgray",
						}}
						ref={localVideoRef}
						autoPlay
						about="caller"
					></video>
				</div>
			</div>
		</div>
	);
};

export default VideoPlayer;
