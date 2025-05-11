import {
    setHttpPublicDir,
    setServicePort,
    startService,
    registerEvent,
    emitEvent,
} from "libranda-server";

setServicePort(5127);
setHttpPublicDir("./html_data");

let counter = 0;

registerEvent("system", "client-connected", (client) => {
    emitEvent(client, "count", "set", { counter: counter });
});

registerEvent("count", "add", (client) => {
    counter++;
    emitEvent("*", "count", "set", { counter: counter });
    console.log("increese counter:", counter);
});

await startService();
