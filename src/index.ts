import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import deleteAccountsJob from "./jobs/deleteAccounts";
import updatePriceAndRank from "./jobs/updatePrice";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server is working");
});

app.listen(port, () => {
    deleteAccountsJob();
    updatePriceAndRank();
    console.log(`⚡️[server]: Server is running at port: ${port}`);
});
