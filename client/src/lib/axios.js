import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000",
});

//  Add authorization header to all requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

// OLD BACKEND
// console.log("API", config.oldBackend.baseUrl);
export const oldBackend = axios.create({
	baseURL: `${config.oldBackend.baseUrl}`,
});

export default api;
