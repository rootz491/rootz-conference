import React from "react";
import ActiveUsers from "./components/ActiveUsers";
import Auth from "./components/Auth";
import TestSocket from "./components/testSocket";

const Home = () => {
	return (
		<div>
			<Auth />
			<TestSocket />
			<ActiveUsers />
		</div>
	);
};

export default Home;
