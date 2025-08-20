require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Data = require("./data.js");

const app = express();

// 中间件（保持简单，确保跨域和JSON解析正常）
app.use(cors()); // 本地和Vercel都允许跨域（生产环境可后续收紧）
app.use(express.json());

// 数据库连接（关键：确保Vercel环境能读到MONGODB_URI）
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB连接成功"))
  .catch((err) => console.error("MongoDB连接失败:", err));

// API路由（路径必须正确，Vercel会映射到根域名下的/api）
app.get("/api", (req, res) => {
  res.send("API正常运行");
});

// 你的核心数据接口（路径为/api/data，与前端请求对应）
app.get("/api/data", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sourceFile = req.query.source;

    const query = sourceFile ? { source: sourceFile } : {};
    const skip = (page - 1) * limit;

    const data = await Data.find(query).skip(skip).limit(limit);
    const total = await Data.countDocuments(query);

    res.status(200).json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "获取数据失败", error: error.message });
  }
});

// 本地开发启动服务（Vercel会自动忽略，用自己的端口）
if (process.env.NODE_ENV !== "production") {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`本地服务运行在 http://localhost:${PORT}`);
  });
}

// 导出供Vercel使用（必须导出app，Vercel会处理请求）
module.exports = app;
