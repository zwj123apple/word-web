require("dotenv").config({ path: './api/.env' });
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json());

// 连接 MongoDB（Vercel 冷启动时会重新连接，无需担心）
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB 连接成功"))
  .catch((err) => console.error("MongoDB 连接失败:", err));

// 核心接口：获取所有考试数据
const cache = {};

app.get("/api/word-data", async (req, res) => {
  try {
    const { bank, page = 1, limit = 100 } = req.query;
    if (!bank) {
      return res.status(400).json({ error: "bank is required" });
    }

    const cacheKey = `${bank}-${page}-${limit}`;
    if (cache[cacheKey]) {
      return res.status(200).json(cache[cacheKey]);
    }

    // Define a generic schema if you don't have a specific one for each bank
    const dynamicSchema = new mongoose.Schema({}, { strict: false });
    // Get or create the model for the specific bank (collection)
    const DynamicModel = mongoose.models[bank] || mongoose.model(bank, dynamicSchema, bank);

    const result = await DynamicModel.find({})
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean()
      .exec();

    cache[cacheKey] = result;
    setTimeout(() => {
      delete cache[cacheKey];
    }, 3600000); // 1 hour cache

    res.status(200).json(result);
  } catch (error) {
    console.error("获取数据失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// Vercel 要求导出 app 而非直接监听端口
module.exports = app;
