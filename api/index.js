require("dotenv").config();
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
app.get("/api/word-data", async (req, res) => {
  try {
    const collections = ["cet4", "cet6", "gaokao"];
    const result = {};
    for (const collName of collections) {
      const collection = mongoose.connection.collection(collName);
      result[collName] = await collection.find({}).toArray();
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("获取数据失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// Vercel 要求导出 app 而非直接监听端口
module.exports = app;
