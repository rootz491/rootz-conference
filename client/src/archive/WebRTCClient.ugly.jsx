// TODO remove comments with TESTING

// TODO When onAnswer is called, we need to send a message to receiver let them know that call has begin (change state of call to true) [via socket]
// TODO When hangup is called, we need to send a message to receiver or sender to let them know that call has ended (change state of call to false) [via socket]
import React, { useEffect } from "react";

const WebRTCClientUgly = () => {
	const [peerConnection, setPeerConnection] = React.useState(null);
	const [inCall, setInCall] = React.useState(false);

	const localVideoRef = React.useRef(null);
	const remoteVideoRef = React.useRef(null);

	// TEMPORARY, FOR TESTING
	const [testOffer, setTestOffer] = React.useState(null);
	const [testAnswer, setTestAnswer] = React.useState(null);
	const [testOfferCandidates, setTestOfferCandidates] = React.useState([]);
	const [testAnswerCandidates, setTestAnswerCandidates] = React.useState([]);

	useEffect(() => {
		createPeerConnection();
	}, []);

	const createPeerConnection = async () => {
		//	setup local streams
		const localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
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
				console.log("local ontrack", track);
				pc.addTrack(track, localStream);
			});
		} else {
			throw new Error(
				"Local stream is not available, please check your camera and microphone"
			);
		}

		//  Pull tracks from remote stream, add to video stream
		if (remoteStream) {
			pc.ontrack = async (event) => {
				event.streams[0].getTracks().forEach((track) => {
					console.log("remote ontrack", track);
					remoteStream.addTrack(track);
				});
			};
		} else {
			throw new Error(
				"Remote stream is not available, please check with your peer connection"
			);
		}

		// //  Update video streams in the DOM
		// localVideoRef.current.srcObject = localStream;
		// remoteVideoRef.current.srcObject = remoteStream;

		setPeerConnection(pc);
	};

	const generateIceCandidate = async (peerType) => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				const candidate = event.candidate.toJSON();
				// console.log(event + " candidate", candidate);

				//  store candidate in database, ref to current user based on peerType (caller or receiver)
				if (peerType === "caller") {
					setTestOfferCandidates([...testOfferCandidates, candidate]);
				} else if (peerType === "receiver") {
					setTestAnswerCandidates([...testAnswerCandidates, candidate]);
				} else {
					throw new Error(
						"Peer type is not available, please look into generating ice candidate"
					);
				}
			}
		};
	};

	const hangup = () => {
		if (!peerConnection) {
			throw new Error("Peer connection is not available");
		}

		peerConnection.close();
		setInCall(false);
		setTestOffer(null);
		setTestAnswer(null);
		setTestOfferCandidates([]);
		setTestAnswerCandidates([]);

		createPeerConnection();
	};

	//	update offer and answer sdp when ice candidate is received from stun server
	useEffect(() => {
		if (testOfferCandidates) {
			setTestOffer(peerConnection?.localDescription);
		}
	}, [testOfferCandidates]);

	useEffect(() => {
		if (testAnswerCandidates) {
			setTestAnswer(peerConnection?.localDescription);
		}
	}, [testAnswerCandidates]);

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

		// TESTING
		setTestOffer(offer);
	};

	// CALLEE SIDE, (answerer)

	// TODO call this function once offer is received from caller and answer is created and sent back to caller
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

		// TODO listen for ice candidates from receiver and add to peer connection
		//  once ice candidate is received (via Socket), call "setIceCandidate"

		// DONT NEED THIS, Because :
		//	when ice candidate is received, we'll update the offer and answer sdp and then send it back to the caller and callee
	};

	// ANSWERER SIDE, (answerer)

	const getCallOffer = async (callId) => {
		//  TODO get offer from database, ref to callId
		return JSON.parse(testOffer);
	};

	const answerCall = async (callId) => {
		// TODO get offer from database, ref to callId
		// TODO get ice candidates from database, ref to callId
		// TODO set ice candidates to peer connection
		// TODO set offer to peer connection
		// TODO create answer
		// TODO set answer to peer connection
		// TODO store answer in database, ref to callId

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

		// TESTING
		setTestAnswer(answer);

		// TODO listen for ice candidates from caller and add to peer connection
		//  once ice candidate is received (via Socket), call "setIceCandidate"
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
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-around",
					alignItems: "center",
					width: "100%",
					height: "200px",
				}}
			>
				<div>
					<p>You</p>
					<video
						style={{ border: "1px solid black" }}
						height="200px"
						ref={localVideoRef}
						autoPlay
					></video>
				</div>
				<div>
					<p>Peer</p>
					<video
						style={{ border: "1px solid black" }}
						height="200px"
						ref={remoteVideoRef}
						autoPlay
					></video>
				</div>
			</div>

			<div>
				<button onClick={startCall}>Start Call</button>

				<div>
					<button onClick={() => answerCall("test")}>Answer Call</button>
					{inCall && <button onClick={hangup}>Hang Up</button>}
				</div>
			</div>

			<div>
				{/* OFFER */}
				<div>
					<div>Offer</div>
					<textarea
						value={testOffer != null ? JSON.stringify(testOffer) : ""}
						onChange={(e) => setTestOffer(e.target.value)}
						rows="10"
						cols="50"
					/>
				</div>
				{/* ON ANSWER */}
				<div>
					<div>Answer</div>
					<textarea
						value={testAnswer != null ? JSON.stringify(testAnswer) : ""}
						onChange={(e) => setTestAnswer(e.target.value)}
						rows="10"
						cols="50"
					/>
					<div>
						<button onClick={() => onAnswer(JSON.parse(testAnswer))}>
							on Answer
						</button>
					</div>
				</div>
				{/* CANDIDATES */}
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-around",
						alignItems: "center",
						margin: "2em",
					}}
				>
					<div>
						<div>Offer Candidates</div>
						<textarea
							value={
								testOfferCandidates != null
									? JSON.stringify(testOfferCandidates)
									: ""
							}
							onChange={(e) =>
								setTestOfferCandidates(JSON.parse(e.target.value))
							}
							rows="10"
							cols="50"
						/>
						<div>
							<button onClick={() => setIceCandidate(testOfferCandidates)}>
								set Ice Candidate
							</button>
						</div>
					</div>
					<div>
						<div>Answer Candidates</div>
						<textarea
							value={
								testAnswerCandidates != null
									? JSON.stringify(testAnswerCandidates)
									: ""
							}
							onChange={(e) =>
								setTestAnswerCandidates(JSON.parse(e.target.value))
							}
							rows="10"
							cols="50"
						/>
						<div>
							<button onClick={() => setIceCandidate(testAnswerCandidates)}>
								set Ice Candidate
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WebRTCClientUgly;
