const ley = require("ley");

function downAll() {
  ley.down({ all: true, dir: "./migrations", driver: "postgres" }); // runs down for all tables
}

downAll();
