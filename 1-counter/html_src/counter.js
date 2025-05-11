import { LibrandaClient } from "libranda-client";

const client = new LibrandaClient();

// Register event handler
client.registerEvent("count", "set", (data) => {
    document.getElementById("count").innerText = data.counter;
});

// Connect to the server
client.connect();

// Send a message
document.getElementById("btn-increment").addEventListener("click", () => {
    client.send("count", "add");
});
