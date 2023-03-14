const jwt = require("jsonwebtoken");

const isRequestAuthenticated = (req, res, next) => {
	try {
		const token = req?.headers?.authorization.split(" ")[1];

		if (!token)
			return res.status(401).json({ message: "auth token not found" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded)
			return res.status(401).json({ message: "auth token not valid" });

		req.user = decoded;
		next();
	} catch (error) {
		console.log(error);
		res.json({ error: "Something went wrong" });
	}
};

const isSocketAuthenticated = (socket, next) => {
	try {
		// verify the JWT in the query string
		const auth = socket.handshake.headers.authorization;
		if (!auth) throw new Error("Authorization header is required");

		const token = auth.split(" ")[1];
		if (!token) throw new Error("Token is required");

		// decode and verify with jwt key
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		if (!payload) throw new Error("Invalid token");

		// use payload for perms
		socket.userInfo = payload;
		next();
	} catch (error) {
		console.log(error.toString());
		socket.disconnect(true);
	}
};

module.exports = {
	isRequestAuthenticated,
	isSocketAuthenticated,
};
