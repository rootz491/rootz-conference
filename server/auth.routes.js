const { Router } = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = Router();

const users = [
	{
		id: 1,
		username: "john",
		password: "1234",
	},
	{
		id: 3,
		username: "joe",
		password: "1234",
	},
	{
		id: 4,
		username: "rootz",
		password: "1234",
	},
];

router.post("/login", (req, res) => {
	try {
		const { username, password } = req.body;

		const user = users.find((user) => user.username == username);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.password !== password) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.json({ token });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Something went wrong" });
	}
});

module.exports = router;

module.exports = {
	router,
	users,
};
