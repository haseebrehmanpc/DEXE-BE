import express from "express";
import cors from "cors";

import WebSocket, { WebSocketServer } from "ws";
let wsCopy = null;
const socketServer = new WebSocketServer({
  port: 3003,
});
const socketError = (txt, err) => {
  console.log("error in ", txt);
  console.log("socket error: ", err);
};

const CalculateHyperLinkLeverage = (jsonData) => {
  const levels = jsonData.data.levels;
  let lowestN1 = null;
  let highestN2 = null;
  levels?.forEach((level) => {
    level?.forEach((entry) => {
      if (
        entry.n === 1 &&
        (lowestN1 === null || parseFloat(entry.px) < lowestN1)
      ) {
        lowestN1 = parseFloat(entry.px);
      } else if (
        entry.n === 2 &&
        (highestN2 === null || parseFloat(entry.px) > highestN2)
      ) {
        highestN2 = parseFloat(entry.px);
      }
    });
  });

  return {
    high: highestN2,
    low: lowestN1,
    time: jsonData?.data?.time,
  };
};
const compareAndSendResponse = (aevoData, hyperlinkData) => {
  const aevoTimestamp = aevoData?.time / 1000000;
  const hyperlinkTimestamp = hyperlinkData?.time;

  // wsCopy.send(JSON.stringify({ ...hyperlinkData }));
  // return
  // Check if aevoData and hyperlinkData are not null before comparing timestamps
  if (aevoTimestamp && hyperlinkTimestamp) {
    if (aevoTimestamp > hyperlinkTimestamp) {
      wsCopy.send(JSON.stringify({ ...aevoData }));
    } else {
      wsCopy.send(JSON.stringify({ ...hyperlinkData }));
    }
  } else if (!aevoTimestamp) {
    // If hyperlinkData is null, send aevoData
    wsCopy.send(JSON.stringify({ ...hyperlinkData }));
  } else if (!hyperlinkTimestamp) {
    // If aevoData is null, send hyperlinkData
    wsCopy.send(JSON.stringify({ ...aevoData }));
  } else {
    // Both aevoData and hyperlinkData are null
    console.error("Both aevoData and hyperlinkData are null");
    console.log("res not send");
  }

  console.log("res send");
};

socketServer.on("connection", (ws) => {
  console.log("NEW CLIENT CONNETED IN WEBSOCKET");
  wsCopy = ws;
  // ws.on("close", () => {
  //   console.log("CLOSED");
  // });

  ws.on("message", (data) => {
    const parseData = JSON.parse(data);
    // console.log("recieved event ", parseData);

    // console.log(`Client has sent us: ${parseData.data}`);
    wsHyperlink.send(
      JSON.stringify({
        method: "subscribe",
        subscription: { type: "l2Book", coin: "BTC" },
      })
    );
    wsAevo.send(
      JSON.stringify({
        op: "subscribe",
        data: ["ticker:BTC:PERPETUAL"],
      })
    );
  });
});

const wsAevo = new WebSocket("wss://ws.aevo.xyz");
const wsHyperlink = new WebSocket("wss://api.hyperliquid.xyz/ws");
let wsAevoLastData = null;
let wsHyperlinkLastData = null;
const app = express();
app.use(cors());
wsAevo.on("error", (err) => socketError("wsAevo", err));
wsHyperlink.on("error", (err) => socketError("wsHyperlink", err));
wsHyperlink.on("open", function open() {
  console.log("connection openned for wsHyperlink ");
});

wsHyperlink.on("message", function message(data) {
  // console.log("wsHyperlink received: %s", data);
  const parseData = JSON.parse(data);
  const { high, low, time } = CalculateHyperLinkLeverage(parseData);
  const spread = +high - +low;
  const midPoint = +low + +high / 2;
  const spreadPercent = (spread / midPoint) * 100;
  const obj = {
    high,
    low,
    time,
    dataOf: "Hyper",
    // spread: spread > 0 ? spread : 0,
    spread: spreadPercent,
  };
  wsHyperlinkLastData = obj;
  if (high && low) {
    compareAndSendResponse(wsAevoLastData, obj);
  }
});

wsAevo.on("open", function open() {
  console.log("opened connection for wsAevo");
});

wsAevo.on("message", function message(data) {
  // console.log("received: %s", data);
  const parsedData = JSON.parse(data);
  // highest bid and lowes ask
  const spread =
    +parsedData?.data?.tickers?.[0]?.ask.price -
    +parsedData?.data?.tickers?.[0]?.bid.price;
  const midPoint =
    (+parsedData?.data?.tickers?.[0]?.ask.price +
      +parsedData?.data?.tickers?.[0]?.bid.price) /
    2;

  const spreadPercent = (spread / midPoint) * 100;
  const obj = {
    low: parsedData?.data?.tickers?.[0]?.bid.price,
    high: parsedData?.data?.tickers?.[0]?.ask.price,
    time: parsedData?.data?.timestamp,
    dataOf: "Aevo",
    spread: spreadPercent,
    // spread,
    // spread: spread > 0 ? spread : 0,
  };
  if (parsedData?.data) {
    wsAevoLastData = obj;
  }
  if (
    parsedData?.data?.tickers?.[0]?.bid.price &&
    parsedData?.data?.tickers?.[0]?.ask.price
  ) {
    compareAndSendResponse(obj, wsHyperlinkLastData);
  }
});
// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
