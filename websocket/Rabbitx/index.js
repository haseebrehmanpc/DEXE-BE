const { socketError } = require("../../utils");
const WebSocket = require("ws");
const wsRabbitx = new WebSocket("wss://api.prod.rabbitx.io/ws");
wsRabbitx.on("error", (err) => socketError("wsRabbitx", err));

wsRabbitx.on("open", function open() {
  console.log("connection openned for wsRabbitx ");
  wsRabbitx.send(
    JSON.stringify({
      connect: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDQ0NSIsImV4cCI6MTcwNDUzNDE5NH0.hkeORwPUnLEmcCEWaPC1UO9oA2sVQAjBBz88ePW3o88",
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
