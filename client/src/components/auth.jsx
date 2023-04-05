import React, { useEffect, useState } from "react";
import api from "../lib/axios";

const baseUrl = "http://localhost:8000";

const Auth = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(null);

	useEffect(() => {
		const t = localStorage.getItem("token");
		setToken(t);
	}, []);

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
	};

	const login = async () => {
		const res = await api.post("/auth/login", {
			username,
			password,
		});
		if (res.status == 200 && res.data?.token) {
			localStorage.setItem("token", res.data?.token);
			setToken(res.data?.token);
		} else {
			alert(res.data?.error ?? "something's broken!");
		}
	};

	if (token)
		return (
			<div>
				<center>
					<strong>User is Authenticated!</strong>
				</center>
				<center>
					<button onClick={logout}>logout</button>
				</center>
			</div>
		);
	else
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
