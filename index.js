const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  compareAndSendResponse,
  calculateHyperLinkLeverage,
  socketError,
  spreadPercentageCalculator,
  generateUnixTimeWithSameLength,
  findVertexIdBySymbol,
  findVertexSymbolById,
} = require("./utils");
const {
  aevoAssets,
  hyperLiquidAssets,
  driftPrepAsset,
  isAssetsExist,
  commonOnFour,
  vertexSymbols,
} = require("./constant/assets");
dotenv.config();
const WebSocket = require("ws");
const WebSocketServer = require("ws").WebSocketServer;
let wsCopy = null;
// let symbol = null;
const subEvents = {};

const wsAevo = new WebSocket("wss://ws.aevo.xyz");
const wsHyperlink = new WebSocket("wss://api.hyperliquid.xyz/ws");
const wsDrift = new WebSocket("wss://dlob.drift.trade/ws");
const wsVertex = new WebSocket(
  "wss://gateway.prod.vertexprotocol.com/v1/subscribe"
);
const app = express();
app.use(cors());
wsAevo.on("error", (err) => socketError("wsAevo", err));
wsVertex.on("error", (err) => socketError("wsVertex", err));
wsHyperlink.on("error", (err) => socketError("wsHyperlink", err));
wsDrift.on("error", (err) => socketError("wsHyperlink", err));
wsHyperlink.on("open", function open() {
  console.log("connection openned for wsHyperlink ");
});
wsVertex.on("open", function open() {
  console.log("connection openned for wsVertex ");
});
wsDrift.on("open", function open() {
  console.log("connection openned for wsDrift ");
});
wsDrift.on("message", function message(data) {
  const parseData = JSON.parse(data);
  const depthData = JSON.parse(parseData?.data || "{}");
  // returning if getting response of other coin
  const coinSymbol = depthData?.marketName?.split("-")?.[0];
  if (!coinSymbol) return;
  if (depthData?.bids?.[0] && depthData?.asks?.[0]) {
    const obj = {
      high: depthData.bids[0].price / 1000000,
      low: depthData.asks[0].price / 1000000,
      time: generateUnixTimeWithSameLength(13),
      dataOf: "Drift",
      symbol: coinSymbol,
    };
    wsDriftLastData = obj;
    compareAndSendResponse(obj, wsCopy);
  }
});
wsHyperlink.on("message", function message(data) {
  const parseData = JSON.parse(data);
  // returning if getting response of other coin
  const coinSymbol = parseData?.data?.coin;
  if (!coinSymbol) return;
  const { high, low, time } = calculateHyperLinkLeverage(parseData);
  const obj = {
    high,
    low,
    time,
    dataOf: "Hyper",
    symbol: coinSymbol,
  };
  if (high && low) {
    wsHyperlinkLastData = obj;
    compareAndSendResponse(obj, wsCopy);
  }
});
const unsubscribePreviousEvents = (data) => {
  const userId = data.id;
  const eventArray = subEvents[userId];
  if (eventArray?.length) {
    eventArray.map((item) => {
      if (item.site === "hyper") {
        const event = { ...item.event, method: "unsubscribe" };
        wsHyperlink.send(JSON.stringify(event));
      }
      if (item.site === "aevo") {
        const event = { ...item.event, op: "unsubscribe" };
        wsAevo.send(JSON.stringify(event));
      }
      if (item.site === "drift") {
        const event = { ...item.event, type: "unsubscribe" };
        wsDrift.send(JSON.stringify(event));
      }
    });
  }
};
const appendSubscribedEvents = (id, event) => {
  if (subEvents[id]) {
    subEvents[id].push(event);
  } else {
    subEvents[id] = [event];
  }
};
wsAevo.on("open", function open() {
  console.log("opened connection for wsAevo");
});

wsVertex.on("message", function message(data) {
  // console.log("received: %s", data);
  const parsedData = JSON.parse(data);

  const coinSymbol = findVertexSymbolById(parsedData?.product_id);
  if (!coinSymbol) return;
  const obj = {
    high: parsedData?.bid_price / 1e18,
    low: parsedData?.ask_price / 1e18,
    time: Math.floor(+parsedData?.timestamp / 1000000),
    dataOf: "Vertex",
    symbol: coinSymbol,
  };
  if (parsedData?.bid_price && parsedData?.ask_price) {
    compareAndSendResponse(obj, wsCopy);
  }
});
wsAevo.on("message", function message(data) {
  // console.log("received: %s", data);
  const parsedData = JSON.parse(data);
  // returning if getting response of other coin
  const coinSymbol = parsedData?.channel?.split(":")?.slice(1, -1)?.[0];
  // if (!coinSymbol) return;
  const obj = {
    high: +parsedData?.data?.tickers?.[0]?.bid.price,
    low: +parsedData?.data?.tickers?.[0]?.ask.price,
    time: Math.floor(+parsedData?.data?.timestamp / 1000000),
    dataOf: "Aevo",
    symbol: coinSymbol,
  };
  if (
    parsedData?.data?.tickers?.[0]?.bid.price &&
    parsedData?.data?.tickers?.[0]?.ask.price
  ) {
    compareAndSendResponse(obj, wsCopy);
  }
});
// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
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

    commonOnFour.map((symbol) => {
      if (isAssetsExist(hyperLiquidAssets, symbol)) {
        const event = {
          method: "subscribe",
          subscription: { type: "l2Book", coin: symbol },
        };
        wsHyperlink.send(JSON.stringify(event));
        appendSubscribedEvents(1, { site: "hyper", event });
      }
      if (isAssetsExist(aevoAssets, symbol)) {
        const event = {
          op: "subscribe",
          data: [`ticker:${symbol}:PERPETUAL`],
        };
        wsAevo.send(JSON.stringify(event));
        appendSubscribedEvents(1, { site: "aevo", event });
      }

      if (isAssetsExist(driftPrepAsset, symbol)) {
        const event = {
          type: "subscribe",
          marketType: "perp",
          channel: "orderbook",
          market: `${symbol}-PERP`,
        };
        wsDrift.send(JSON.stringify(event));
        appendSubscribedEvents(1, { site: "drift", event });
      }
      if (isAssetsExist(vertexSymbols, symbol)) {
        console.log("Vertex");
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
        appendSubscribedEvents(1, { site: "Vertex", event });
      }
    });
  });
});
function keepHyperLiquidLive() {
  wsHyperlink.send(JSON.stringify({ method: "ping" }));
  console.log("Keeping hyper liquid alive!");
}

function keepVertexLive() {
  wsVertex.send(
    JSON.stringify({
      method: "subscribe",
      stream: {
        type: "best_bid_offer",
        product_id: 800,
      },
      id: 0,
    })
  );
  console.log("Keeping vertex liquid alive!");
}

const intervalId = setInterval(keepHyperLiquidLive, 60000);
const intervalId2 = setInterval(keepVertexLive, 30000);
