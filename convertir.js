const fs = require("fs");
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

const archivos = [
  "trip_updates.pb",
  "vehicle_positions.pb",
  "alerts.pb"
];

for (const archivo of archivos) {
  try {

    const data = fs.readFileSync(archivo);

    const feed =
      GtfsRealtimeBindings.transit_realtime
      .FeedMessage
      .decode(data);

    const json = feed.toJSON();

    const salida =
      archivo.replace(".pb", ".json");

    fs.writeFileSync(
      salida,
      JSON.stringify(json, null, 2)
    );

    console.log(`✅ Generado ${salida}`);

  } catch (e) {

    console.log(`❌ Error en ${archivo}`);
    console.log(e.message);

  }
}