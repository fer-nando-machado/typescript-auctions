import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "yaml";

const swaggerRouter = express.Router();

const apiPath = path.join(__dirname, "../../../openapi.yaml");
const apiDocs = yaml.parse(fs.readFileSync(apiPath, "utf8"));

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(apiDocs));

export default swaggerRouter;
