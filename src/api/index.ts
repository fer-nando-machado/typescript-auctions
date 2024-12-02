import express from "express";
import swaggerRouter from "./swagger";
import auctionRouter from "./auction";
import { authenticate } from "./user";

const app = express();
app.use(express.json());
app.use("/swagger", swaggerRouter);

app.use(authenticate);
app.use("/auctions", auctionRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
