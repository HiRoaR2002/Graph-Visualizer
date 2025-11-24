import express from "express";
import * as txService from "../services/transaction.service.js";

const router = express.Router();

// POST /transactions - add or update transaction
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const tx = await txService.createTransaction(payload);
    res.status(201).json(tx);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction", details: err.message });
  }
});

// GET /transactions - list transactions (supports ?limit=&skip=)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "100", 10);
    const skip = parseInt(req.query.skip || "0", 10);
    const txs = await txService.listTransactions({ limit, skip });
    res.json(txs);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to list transactions", details: err.message });
  }
});

export default router;
