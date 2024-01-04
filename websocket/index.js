const { WebSocketServer } = require("ws");
const {
  commonOnFive,
  isAssetsExist,
  hyperLiquidAssets,
  aevoAssets,
  driftPrepAsset,
  vertexSymbols,
  rabbitxSymbol,
} = require("../constant/assets");
const { wsHyperlink } = require("./HyperLiquid");
const { hyperListner } = require("./HyperLiquid/listener");
const { wsAevo } = require("./Aevo");
const { wsDrift } = require("./Drift");
const { wsVertex } = require("./Vertex");
const { wsRabbitx } = require("./Rabbitx");
const { findVertexIdBySymbol } = require("../utils");
const { aevoListener } = require("./Aevo/listener");
const { driftListener } = require("./Drift/listener");
const { rabbitxListener } = require("./Rabbitx/listener");
const { vertexListener } = require("./Vertex/listener");

let wsCopy;
const createWebsocketServer = (server) => {
  const socketServer = new WebSocketServer({
    server: server,
  });

  socketServer.on("connection", (ws) => {
    console.log("NEW CLIENT CONNETED IN WEBSOCKET");
    wsCopy = ws;
    ws.on("close", () => {
      console.log("CLOSED");
    });

    ws.on("message", async (data) => {
      const parseData = JSON.parse(data);
      console.log("recieved event ", parseData);

      // unsubscribePreviousEvents({ id: 1 });
      // await resetAllData();
      // console.log(`Client has sent us: ${parseData.data}`);
      aevoListener(ws);
      driftListener(ws);
      hyperListner(ws);
      rabbitxListener(ws);
      vertexListener(ws);
      commonOnFive.map((symbol) => {
        if (isAssetsExist(hyperLiquidAssets, symbol)) {
          const event = {
            method: "subscribe",
            subscription: { type: "l2Book", coin: symbol },
          };
          wsHyperlink.send(JSON.stringify(event));
          // appendSubscribedEvents(1, { site: "hyper", event });
        }
        if (isAssetsExist(aevoAssets, symbol)) {
          const event = {
            op: "subscribe",
            data: [`ticker:${symbol}:PERPETUAL`],
          };
          wsAevo.send(JSON.stringify(event));
          // appendSubscribedEvents(1, { site: "aevo", event });
        }

        if (isAssetsExist(driftPrepAsset, symbol)) {
          const event = {
            type: "subscribe",
            marketType: "perp",
            channel: "orderbook",
            market: `${symbol}-PERP`,
          };
          wsDrift.send(JSON.stringify(event));
          // appendSubscribedEvents(1, { site: "drift", event });
        }
        if (isAssetsExist(vertexSymbols, symbol)) {

          const pid = findVertexIdBySymbol(symbol);
          if (!pid) return;
          const event = {
            method: "subscribe",
            stream: {
              type: "best_bid_offer",
              product_id: pid,
            },
            id: 0,
          };
          wsVertex.send(JSON.stringify(event));
          // appendSubscribedEvents(1, { site: "Vertex", event });
        }
        if (isAssetsExist(rabbitxSymbol, symbol)) {
          const event = {
            subscribe: { channel: `market:${symbol}-USD`, name: "js" },
            id: 1,
          };
          wsRabbitx.send(JSON.stringify(event));
          // appendSubscribedEvents(1, { site: "Rabbitx", event });
        }
      });
    });
  });
};

module.exports = {
  createWebsocketServer,
  wsCopy,
};
