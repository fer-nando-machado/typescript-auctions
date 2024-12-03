import express from "express";
import swaggerRouter from "./swagger";
import auctionRouter from "./auction";
import { authenticate } from "./user";

const app = express();
app.use(express.json());
app.get("/", (_, res) => res.redirect("/docs"));
app.use("/docs", swaggerRouter);

app.use(authenticate);
app.use("/auctions", auctionRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server is up and running at http://localhost:${PORT}`);
});
