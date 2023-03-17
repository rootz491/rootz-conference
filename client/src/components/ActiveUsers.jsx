import React, { useState } from "react";

const ActiveUsers = () => {
	const [activeUsers, setActiveUsers] = useState([]);

	// setActiveUsers will be called by a server-side socket event called "active"
	// whenever someone becomes online, this event will trigger and will broadcast to everyone that a person is active in the platform

	// hense, user will be visible to other users.

	// other user can initiate the call and send him/user "an offer" (as an event) in order to talk to then if they accept the call and respond with answer (as an event).
	//  once exchange of sdp is done, users will be connected and hense, video call is started!!!

	//    pretty easy yea?!  i dont think so :P

	const callUser = (socketId) => {
		if (!socketId) {
			alert("Couldn't find socket ID of this user, please try again later!");
			return;
		}

		// initialize the call!
		// <VideoPlayer />

		// this component will be part of this ActiveUsers page (for now XD)
		// component will pop-up as modal in top of other thing in this page!
	};

	return (
		<div>
			<h3>ActiveUsers</h3>

			{activeUsers.length == 0 ? (
				"Noone is active at the moment"
			) : (
				<ul>
					{activeUsers
						// filter current user from the list of users!
						?.map((user) => {
							return (
								<li>
									{user.name ?? "User Name"}
									{user.userId ?? "User ID"}
									{user.socketId ?? "Socket ID"}
									<button onClick={() => callUser(user?.socketId ?? null)}>
										call
									</button>
								</li>
							);
						})}
				</ul>
			)}
		</div>
	);
};

export default ActiveUsers;
