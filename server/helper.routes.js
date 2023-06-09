const { Router } = require("express");
const { sockets, webRTCRooms } = require("./socket");
const { users } = require("./auth.routes");

const router = Router();

router.get("/", (req, res) => {
	res.send("Server is running!");
});

router.get("/connections", (req, res) => {
	res.json({
		connections: sockets.map((connection) => ({
			...connection,
			username: users.find((user) => user.id === connection.userId).username,
		})),
		total: sockets.length,
	});
});

router.get("/rooms", (req, res) => {
	res.json({
		rooms: webRTCRooms,
	});
});

module.exports = router;
