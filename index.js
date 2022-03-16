// Create a basic expressJS app and handle "/psc" route.
// The response should be a string that says "Hello World".
const express = require("express");
const app = express();
const limitter = require("express-rate-limit");
// import cors.
const cors = require("cors");

// Import dotenv package and set environment variables.
require("dotenv").config();
const path = require("path");

const serverUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_SERVER_URL
    : process.env.LOCAL_SERVER_URL;
// Import fetch from "Cross-fetch"
const fetch = require("cross-fetch");
// Import './StatusCode.js'
const StatusCode = require("./StatusCode");
// Import Swagger-JsDoc and Swagger-Ui.
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nirdesh API",
      description:
        "Hello! I'm Nirdesh pokharel. All these API are custom made API by myself.\n These API provided by this site isn't any official API's from the particular Govermental Bodies. When you hit these provided API endpoints, our server fetches all the data in realtime with no modification to the original data provided by the official site of the governmental bodies.\n Use this API for 𝗣𝗘𝗥𝗦𝗢𝗡𝗔𝗟 𝗨𝗦𝗘 𝗢𝗡𝗟𝗬.",
      version: "0.0.1",
      contact: {
        name: "Nirdesh Pokharel",
      },
      servers: [
        {
          url: "",
        },
      ],
    },
  },
  apis: ["./index.js", "./src/routes/*.js"],
  swagger: "2.0",
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

// Set public folder as static and make it publicly available.
app.use(express.static("public"));

/**
 * @swagger
 * components:
 *  schemas:
 *   PSC:
 *    type: object
 *    properties:
 *     noticePDFLink:
 *      type: string
 *      description: Link to the PDF of the PSC's notice.
 *     datePublished:
 *      type: string
 *      description: Published date of the PSC's notice.
 *     title:
 *      type: string
 *      description: Title string of the PSC's notice.
 *    example:
 *      noticePDFLink: "https://psc.gov.np/mediacenter/PDF.link.pdf"
 *      datePublished: "2020-01-01"
 *      title: "पद संख्या संशोधन तथा नयाँ विज्ञापन गरिएकाे सूचना ।"
 *
/**
 * @swagger
 * tags:
 *  name: PSC
 *  summary: Everything about PSC's notice.
 *  description: Everything about PSC's notice.
 */

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    explorer: false,
    swaggerOptions: {
      docExpansion: "list",
      filter: true,
      displayRequestDuration: true,
      displayTags: true,
    },
  })
);

// Use express's inbuilt bodyparser.
app.use(express.json());
// Remove X-powered header.
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
// use cors to allow cross origin resource sharing
app.use(cors());

// Use express rate limitter.
app.use(
  limitter({
    windowMs: 2 * 1000, // 1 second
    // 2 requests per second.
    max: 2,
    message: {
      message:
        "Too many requests from this IP, please try again after 1 minute.",
      statusCode: 429,
    },
  })
);

// Set up own "X-powered by header"
app.use((_req, res, next) => {
  res.setHeader("X-Powered-By", "Nirdesh Pokharel");
  next();
});
// Use ejs as view engine.
app.set("view engine", "ejs");
// Set up static folder.
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  var data = [];
  try {
    await fetch("https://psc-notices.herokuapp.com/data")
      .then((res) => res.json())
      .then((response) => {
        data = response;
      });
    res.render("index", {
      title: "लोक सेवा आयोग",
      noticeTitle: "लोक सेवा आयोगको वेभसाईटमा प्रकाशित बिज्ञापनहरुको सुची",
      notices: data,
    });
  } catch (error) {
    res
      .status(StatusCode.badRequest)
      .header({ "Content-Type": "application/json" })
      .send({
        message: "Something went wrong. Please check and try again.",
        errorMessage: error.message,
        status: StatusCode.badRequest,
      });
  }

  // res.render("index", { title: "Test App",data });
});
// Listen on environment's PORT variable or default to 3000.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
