import React from "react";
import ActiveUsers from "./components/ActiveUsers";
import Auth from "./components/auth";

const Home = () => {
	return (
		<div>
			<Auth />
			<ActiveUsers />
		</div>
	);
};

export default Home;
