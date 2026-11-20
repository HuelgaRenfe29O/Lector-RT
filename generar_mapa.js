const fs = require("fs");

// ======================
// STOPS
// ======================

const stops = {};

fs.readFileSync("stops.txt", "utf8")
  .split(/\r?\n/)
  .slice(1)
  .forEach(linea => {

    if (!linea.trim()) return;

    const c = linea.split(",");

    if (c.length >= 2) {
      stops[c[0].trim()] = c[1].trim();
    }

  });

// ======================
// STOP TIMES
// ======================

const viajes = {};

fs.readFileSync("stop_times.txt", "utf8")
  .split(/\r?\n/)
  .slice(1)
  .forEach(linea => {

    if (!linea.trim()) return;

    const c = linea.split(",");

    if (c.length < 5) return;

    const tripId = c[0].trim();

    if (!viajes[tripId]) {
      viajes[tripId] = [];
    }

    viajes[tripId].push({
      llegada: c[1].trim(),
      salida: c[2].trim(),
      stopId: c[3].trim(),
      secuencia: parseInt(c[4], 10)
    });

  });

// ======================
// NÚCLEOS
// ======================

function obtenerNucleo(routeId) {

  const prefijo = routeId.substring(0, 2);

  switch (prefijo) {

    case "10":
      return "Madrid";

    case "20":
      return "Asturias";

    case "30":
      return "Sevilla";

    case "31":
      return "Cádiz";

    case "32":
      return "Málaga";

    case "40":
      return "Valencia";

    case "41":
    case "45":
      return "Murcia/Alicante";

    case "46":
      return "Ferrol";

    case "47":
      return "León";

    case "51":
      return "Barcelona";

    case "60":
      return "Bilbao";

    case "61":
      return "Donostia";

    case "62":
      return "Santander";

    case "70":
      return "Zaragoza";

    default:
      return "Otros";
  }
}

// ======================
// GENERAR MAPA
// ======================

const resultado = {};

fs.readFileSync("trips.txt", "utf8")
  .split(/\r?\n/)
  .slice(1)
  .forEach(lineaTxt => {

    if (!lineaTxt.trim()) return;

    const c = lineaTxt.split(",");

    if (c.length < 7) return;

    const routeId = c[0].trim();
    const tripId = c[2].trim();
    const blockId = c[5].trim();

    const recorrido = viajes[tripId];

    if (!recorrido || recorrido.length === 0) {
      return;
    }

    recorrido.sort(
      (a, b) => a.secuencia - b.secuencia
    );

    const primera = recorrido[0];
    const ultima = recorrido[recorrido.length - 1];

    const origen =
      stops[primera.stopId] ||
      primera.stopId;

    const destino =
      stops[ultima.stopId] ||
      ultima.stopId;

    let linea = routeId;

    const mCercanias =
      routeId.match(/C\d+[A-Z]?/i);

    if (mCercanias) {
      linea = mCercanias[0].toUpperCase();
    }

    const mRodalies =
      routeId.match(/RG\d+|RL\d+|R\d+/i);

    if (mRodalies) {
      linea = mRodalies[0].toUpperCase();
    }

    const tren =
      tripId.match(/(\d{5})/)?.[1]
      || tripId;

    resultado[tripId] = {

      tren,
      tripId,
      routeId,
      blockId,
      linea,

      nucleo: obtenerNucleo(routeId),

      origen,
      destino,

      salida: primera.salida,
      llegada: ultima.llegada

    };

  });

// ======================
// GUARDAR JSON
// ======================

fs.writeFileSync(
  "trip_map.json",
  JSON.stringify(
    resultado,
    null,
    2
  )
);

console.log(
  "Generados",
  Object.keys(resultado).length,
  "viajes"
);