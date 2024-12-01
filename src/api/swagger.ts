import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "yaml";

const swaggerRouter = express.Router();

const swaggerYamlPath = path.join(__dirname, "./api.yaml");
const swaggerDocument = yaml.parse(fs.readFileSync(swaggerYamlPath, "utf8"));

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default swaggerRouter;
