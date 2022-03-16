// Import dotenv
require("dotenv").config();
var serverUrl =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.PRODUCTION_SERVER_URL
    : process.env.LOCAL_SERVER_URL;
module.exports = {
  JWT_SECRET: "1hznfo0u1#$%^&*xp40bg4x5my",
  SALT: "#$%UJKHDY^&^IYHKB",
  serverUrl,
};
