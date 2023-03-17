import React, { useEffect, useState } from "react";
import api from "../lib/axios";

const baseUrl = "http://localhost:8000";

const Auth = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(null);

	useEffect(() => {
		if (token != null) {
			const t = localStorage.getItem("token");
			setToken(t);
		}
	}, []);

	const login = async () => {
		const res = await api("/auth/login", {
			username,
			password,
		});
		if (res.status == 200 && res.data?.token) {
			localStorage.setItem("token", res.data?.token);
		} else {
			alert(res.data?.error ?? "something's broken!");
		}
	};

	return (
		<div>
			<center>
				<strong>User is Authenticated!</strong>
			</center>
		</div>
	);

	return (
		<div>
			<input
				type="text"
				placeholder="username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				type="password"
				placeholder="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button onClick={login}>login</button>
		</div>
	);
};

export default Auth;
