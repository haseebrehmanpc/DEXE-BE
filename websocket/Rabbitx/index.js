const { socketError } = require("../../utils");
const WebSocket = require("ws");
const { RABBITX_URL } = require("../../config/index");
const wsRabbitx = new WebSocket(RABBITX_URL);
const { getToken } = require("./utils");

wsRabbitx.on("error", (err) => socketError("wsRabbitx", err));

wsRabbitx.on("open", async function open() {
  console.log("connection openned for wsRabbitx ");

  wsRabbitx.send(
    JSON.stringify({
      connect: {
        token: await getToken(),
        name: "js",
      },
      id: 1,
    })
  );
});

function keepRabbitXLive() {
  wsRabbitx.send(JSON.stringify({}));
  console.log("Keeping Rabbitx alive!");
}

const intervalId3 = setInterval(keepRabbitXLive, 3000);

module.exports = {
  wsRabbitx,
};
