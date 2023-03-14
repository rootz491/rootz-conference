const express = require("express");
const cors = require("cors");
const { init } = require("./socket");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", require("./helper.routes"));
app.use("/auth", require("./auth.routes").router);

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
	cors: {
		origin: "*",
	},
});

httpServer.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`);
	init(io);
});
