import React, { useEffect, useState } from "react";
import { useSocket } from "../contexts/socket";
import VideoPlayer from "./VideoPlayer";
import api from "../lib/axios";

const ActiveUsers = () => {
	const { value, setValue } = useSocket();
	const [activeUsers, setActiveUsers] = useState([]);
	const [currentUserId, setCurrentUserId] = useState(-1);

	const [caller, setCaller] = useState(false);
	const [callee, setCallee] = useState(false);
	const [inCallMeta, setInCallMeta] = useState(null);

	// setActiveUsers will be called by a server-side socket event called "active"
	// whenever someone becomes online, this event will trigger and will broadcast to everyone that a person is active in the platform

	// hense, user will be visible to other users.

	// other user can initiate the call and send him/user "an offer" (as an event) in order to talk to then if they accept the call and respond with answer (as an event).
	//  once exchange of sdp is done, users will be connected and hense, video call is started!!!

	//    pretty easy yea?!  i dont think so :P

	useEffect(() => {
		const userId = JSON.parse(atob(localStorage?.token?.split(".")[1]))?.id;
		getOnlineUsers();
		if (localStorage?.token) setCurrentUserId(userId);
	}, []);

	// this will be called when a user becomes active
	useEffect(() => {
		if (value?.availableUser) {
			const newUser = value.availableUser;
			// reset the value of availableUser to null
			setValue((prev) => ({ ...prev, availableUser: null }));

			console.log(newUser.userId, currentUserId);

			// if the user is the current user, then dont add him to the list of active users
			if (newUser.userId == currentUserId) return;

			// add the user to the list of active users
			setActiveUsers((prev) => [...prev, newUser]);
		}
	}, [value]);

	// this will be called when user receives a call
	useEffect(() => {
		if (value?.call) {
			const call = value.call;
			// reset the value of call to null
			setValue((prev) => ({ ...prev, call: null }));

			console.log("Getting a call", call);

			// if the user is the current user, then dont add him to the list of active users
			if (call?.meta?.callee?.userId == currentUserId) {
				setCallee(true);
				setCaller(false);
				setInCallMeta(call);
			}
		}
	}, [value]);

	const getOnlineUsers = () => {
		api
			.get("connections")
			.then((res) => {
				if (res.status == 200) {
					console.log(res.data);
					setActiveUsers(res.data.connections);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const callUser = (user) => {
		if (!user?.socketId) {
			alert("Couldn't find socket ID of this user, please try again later!");
			return;
		}

		setCaller(true);

		const userMeta = {
			caller: value?.me ?? {},
			callee: user,
		};

		setInCallMeta(userMeta);

		// this is alright i guess

		// initialize the call!
		// <VideoPlayer />

		// this component will be part of this ActiveUsers page (for now XD)
		// component will pop-up as modal in top of other thing in this page!
	};

	return (
		<>
			<div>
				<h3>ActiveUsers</h3>

				{activeUsers.length == 0 ? (
					"Noone is active at the moment"
				) : (
					<ul>
						{activeUsers
							// filter current user from the list of users!
							?.filter((user) => user.userId != currentUserId)
							?.map((user) => {
								return (
									<li>
										{user.username ?? "User Name"}
										{/* {user.userId ?? "User ID"} */}
										{/* {user.socketId ?? "Socket ID"} */}
										<button onClick={() => callUser(user)}>call</button>
									</li>
								);
							})}
					</ul>
				)}
			</div>

			<div>
				{caller && <VideoPlayer userMeta={inCallMeta} caller={caller} />}
				{callee && <VideoPlayer userMeta={inCallMeta} callee={callee} />}
			</div>
		</>
	);
};

export default ActiveUsers;
