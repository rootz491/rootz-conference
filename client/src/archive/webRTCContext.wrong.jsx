import React, { useContext, createContext, useState, useEffect } from "react";
import { useSocket } from "../contexts/socket";
import { answerMade, callUser, sendIceCandidate } from "../contexts/socket/emit";

const WebRTCContext = createContext({});

const useWebRTC = () => useContext(WebRTCContext);

const WebRTCProvider = ({ children }) => {
	const { value, setValue } = useSocket();
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);

	const [isAlreadyCalling, setIsAlreadyCalling] = useState(false);
	const [enableIceCandidate, setEnableIceCandidate] = useState(false);

	const { RTCPeerConnection, RTCSessionDescription } = window;
	const peerConnection = new RTCPeerConnection({
		iceServers: [
			{
				urls: [
					"stun:stun1.l.google.com:19302",
					"stun:stun2.l.google.com:19302",
				],
			},
		],
		iceCandidatePoolSize: 10,
	});

	// when a new room gets created, listen for it
	useEffect(() => {
		if (value?.rooms) {
			console.log("new room created", value.rooms[value.rooms.length - 1]);
		}
	}, [value]);

	//	when someone joins your room, listen for it
	useEffect(() => {
		if (value?.latestRoom) {
			console.log("someone joined the room", value.latestRoom);
			onRoomJoined(value.latestRoom);
		}
	}, [value]);

	//  when joinee's answer is added to peerConnection.remoteDescription,
	//	start adding ice candidates
	useEffect(() => {
		if (enableIceCandidate === true) {
			if (
				value.latestRoom?.iceCandidates != null &&
				value.latestRoom?.iceCandidates?.length > 0
			) {
				console.log("adding ice candidates", value.latestRoom?.iceCandidates);
				value.latestRoom?.iceCandidates?.forEach((candidate) => {
					peerConnection.addIceCandidate(candidate);
				});
				setValue((prev) => ({
					...prev,
					latestRoom: {
						...prev.latestRoom,
						iceCandidates: [],
					},
				}));
			}
		}
	}, [enableIceCandidate, value]);

	// inititate a call (for caller)
	async function createRoom() {
		registerPeerConnectionListeners(peerConnection);

		//	media stream
		localStream?.getTracks().forEach((track) => {
			peerConnection.addTrack(track, localStream);
		});

		peerConnection.addEventListener("track", (event) => {
			console.log("Got remote track:", event.streams[0]);
			event.streams[0]?.getTracks().forEach((track) => {
				console.log("Add a track to the remoteStream:", track);
				remoteStream.addTrack(track);
			});
		});

		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

		const roomWithOffer = {
			offer: {
				type: offer.type,
				sdp: offer.sdp,
			},
		};

		// Send offer (room) to server
		callUser(roomWithOffer);
	}

	// join a call (for receiver)
	async function joinRoom(room, peerConnection) {
		// Join room
		if (room == null || room?.offer == null) {
			return;
		}

		//	media stream
		localStream?.getTracks().forEach((track) => {
			peerConnection?.addTrack(track, localStream);
		});

		peerConnection.addEventListener("track", (event) => {
			console.log("Got remote track:", event.streams[0]);
			event.streams[0]?.getTracks().forEach((track) => {
				console.log("Add a track to the remoteStream:", track);
				remoteStream?.addTrack(track);
			});
		});

		registerPeerConnectionListeners(peerConnection);

		room?.owner?.socketId &&
			createIceCandidates(peerConnection, room?.owner?.socketId);

		await peerConnection.setRemoteDescription(room.offer);

		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);

		const roomWithAnswer = {
			answer: {
				type: answer.type,
				sdp: answer.sdp,
			},
		};

		// Send answer to server
		answerMade({
			...room,
			...roomWithAnswer,
		});
	}

	// when someone joins your room, connect to them
	//	(for caller, to know when receiver joins room)
	async function onRoomJoined(room) {
		if (room == null || room?.answer == null) {
			return;
		}

		// await peerConnection.setLocalDescription(
		// 	new RTCSessionDescription(room.offer)
		// );

		await peerConnection.setRemoteDescription(
			new RTCSessionDescription(room.answer)
		);

		setEnableIceCandidate(true);

		if (!isAlreadyCalling) {
			createRoom(room);
			setIsAlreadyCalling(true);
		}

		// peerConnection.addEventListener("track", (event) => {
		// 	console.log("Got remote track:", event.streams[0]);
		// 	event.streams[0].getTracks().forEach((track) => {
		// 		console.log("Add a track to the remoteStream:", track);
		// 		remoteStream.addTrack(track);
		// 	});
		// });

		// peerConnection.ontrack = function ({ streams: [stream] }) {
		// 	const remoteVideo = document.getElementById("remote-video");
		// 	if (remoteVideo) {
		// 		remoteVideo.srcObject = stream;
		// 	}
		// };
	}

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

	async function openUserMedia(localVideoRef, remoteVideoRef) {
		const localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false,
		});

		const remoteStream = new MediaStream();

		// localStream = stream;
		setLocalStream(localStream);
		setRemoteStream(remoteStream);

		remoteVideoRef.srcObject = remoteStream;
		localVideoRef.srcObject = localStream;

		console.log("Local Stream:", localVideoRef.srcObject);
		console.log("Remote Stream:", remoteVideoRef.srcObject);

		// document.querySelector("#cameraBtn").disabled = true;
		// document.querySelector("#joinBtn").disabled = false;
		// document.querySelector("#createBtn").disabled = false;
		// document.querySelector("#hangupBtn").disabled = false;

		// stream
		// 	.getTracks()
		// 	.forEach((track) => peerConnection.addTrack(track, stream));

		// peerConnection.ontrack = function ({ streams: [stream] }) {
		// 	console.log("remote stream", stream);
		// 	remoteVideoRef.srcObject = stream;
		// };
	}

	async function hangUp(localVideoRef) {
		const tracks = localVideoRef.srcObject?.getTracks();

		tracks.forEach((track) => {
			track.stop();
		});

		if (remoteStream) {
			remoteStream?.getTracks().forEach((track) => track.stop());
		}

		if (peerConnection) {
			peerConnection.close();
		}

		alert("Call Ended");
	}

	async function createIceCandidates(peerConnection, ownerSocketId) {
		peerConnection.onicecandidate = function (event) {
			/* Get event.candidate and give it to the offerer */
			if (event.candidate) {
				const json = event.candidate.toJSON();
				console.log("candidate", json);
				sendIceCandidate({
					ownerSocketId,
					candidate: json,
				});
			}
		};
	}

	return (
		<WebRTCContext.Provider
			value={{
				createRoom: createRoom,
				joinRoom: joinRoom,
				openUserMedia: openUserMedia,
				hangUp: hangUp,
			}}
			// answerCall={answerCall}
			// handleAnswer={handleAnswer}
		>
			{children}
		</WebRTCContext.Provider>
	);
};

export default WebRTCProvider;
export { useWebRTC };
