const express = require("express");
const path = require("path");
const axios = require("axios");
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/api/trips", async (req, res) => {

  try {

    const response = await axios({
      url: "https://gtfsrt.renfe.com/trip_updates.pb",
      responseType: "arraybuffer"
    });

    const feed =
      GtfsRealtimeBindings
      .transit_realtime
      .FeedMessage
      .decode(
        new Uint8Array(response.data)
      );

    res.json(feed.toJSON());

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});