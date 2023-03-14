import React from "react";
import { useSocket } from "../contexts/socket";
import { testEmit } from "../contexts/socket/emit";

const TestSocket = () => {
	const { value } = useSocket();

	return (
		<div>
			<p>Wanna send "Hello World" to server ?</p>
			<button onClick={testEmit}>Test Socket</button>

			{value && value?.test && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "20px",
					}}
				>
					<h5>Received:</h5>
					<p>{value.test}</p>
				</div>
			)}
		</div>
	);
};

export default TestSocket;
