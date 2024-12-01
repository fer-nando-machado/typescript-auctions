import express from "express";
import auctionRouter from "./auction";
import swaggerRouter from "./swagger";
import { authorize } from "./user";

const app = express();
app.use(express.json());
app.use("/swagger", swaggerRouter);

app.use(authorize);
app.use("/auctions", auctionRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
