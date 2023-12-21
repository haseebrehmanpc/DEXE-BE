const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  compareAndSendResponse,
  calculateHyperLinkLeverage,
  socketError,
  spreadPercentageCalculator,
  generateUnixTimeWithSameLength,
} = require("./utils");
const {
  aevoAssets,
  hyperLiquidAssets,
  driftPrepAsset,
  isAssetsExist,
} = require("./constant/assets");
dotenv.config();
const WebSocket = require("ws");
const WebSocketServer = require("ws").WebSocketServer;
let wsCopy = null;
let symbol = null;
console.log("is process.env.WEBSOCKET_PORT : ", process.env.WEBSOCKET_PORT);
const websocketPort = process.env.WEBSOCKET_PORT || 3003;
const socketServer = new WebSocketServer({
  port: websocketPort,
});
const subEvents = {};
socketServer.on("connection", (ws) => {
  console.log("NEW CLIENT CONNETED IN WEBSOCKET");
  wsCopy = ws;
  ws.on("close", () => {
    console.log("CLOSED");
  });

  ws.on("message", (data) => {
    const parseData = JSON.parse(data);
    console.log("recieved event ", parseData);
    symbol = parseData.data.coin;
    unsubscribePreviousEvents({ id: 1 });
    resetAllData();
    // console.log(`Client has sent us: ${parseData.data}`);
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
  });
});

const wsAevo = new WebSocket("wss://ws.aevo.xyz");
const wsHyperlink = new WebSocket("wss://api.hyperliquid.xyz/ws");
const wsDrift = new WebSocket("wss://dlob.drift.trade/ws");
let wsAevoLastData = null;
let wsHyperlinkLastData = null;
let wsDriftLastData = null;

const resetAllData = () => {
  wsAevoLastData = null;
  wsHyperlinkLastData = null;
  wsDriftLastData = null;
};
const app = express();
app.use(cors());
wsAevo.on("error", (err) => socketError("wsAevo", err));
wsHyperlink.on("error", (err) => socketError("wsHyperlink", err));
wsDrift.on("error", (err) => socketError("wsHyperlink", err));
wsHyperlink.on("open", function open() {
  console.log("connection openned for wsHyperlink ");
});
wsDrift.on("open", function open() {
  console.log("connection openned for wsDrift ");
});
wsDrift.on("message", function message(data) {
  const parseData = JSON.parse(data);
  const depthData = JSON.parse(parseData.data || "{}");
  if (depthData?.bids?.[0] && depthData?.asks?.[0]) {
    console.log("parsed data highest bid :", depthData.bids[0]);
    console.log("parsed data low ask :", depthData.asks[0]);
    const obj = {
      high: depthData.bids[0].price / 1000000,
      low: depthData.asks[0].price / 1000000,
      time: generateUnixTimeWithSameLength(13),
      dataOf: "Drift",
    };
    wsDriftLastData = obj;
    compareAndSendResponse(
      wsAevoLastData,
      wsHyperlinkLastData,
      obj,
      wsCopy,
      symbol
    );
  }
});
wsHyperlink.on("message", function message(data) {
  const parseData = JSON.parse(data);
  const { high, low, time } = calculateHyperLinkLeverage(parseData);
  const obj = {
    high,
    low,
    time,
    dataOf: "Hyper",
  };
  if (high && low) {
    wsHyperlinkLastData = obj;
    compareAndSendResponse(
      wsAevoLastData,
      obj,
      wsDriftLastData,
      wsCopy,
      symbol
    );
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

wsAevo.on("message", function message(data) {
  // console.log("received: %s", data);
  const parsedData = JSON.parse(data);

  const obj = {
    low: +parsedData?.data?.tickers?.[0]?.bid.price,
    high: +parsedData?.data?.tickers?.[0]?.ask.price,
    time: parsedData?.data?.timestamp,
    dataOf: "Aevo",
  };
  if (parsedData?.data?.low && parsedData?.data?.high) {
    wsAevoLastData = obj;
  }
  console.log("obj >", obj);
  if (
    parsedData?.data?.tickers?.[0]?.bid.price &&
    parsedData?.data?.tickers?.[0]?.ask.price
  ) {
    compareAndSendResponse(
      obj,
      wsHyperlinkLastData,
      wsDriftLastData,
      wsCopy,
      symbol
    );
  }
});
// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

console.log("is env running ", process.env.PORT);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
