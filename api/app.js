// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const dictionaryRoutes = require("./routes/dictionary");

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000"],
    credentials: true,
  })
);

// 请求日志
app.use(morgan("combined"));

// 请求体解析
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100次请求
  message: {
    error: "Too many requests, please try again later.",
  },
});

const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每小时最多5次批量更新
  message: {
    error: "Too many batch update requests, please try again later.",
  },
});

app.use("/api/dictionary", limiter);
app.use("/api/dictionary/update", updateLimiter);

// 路由
app.use("/api/dictionary", dictionaryRoutes);

// 根路径
app.get("/", (req, res) => {
  res.json({
    name: "Dictionary API Service",
    version: "1.0.0",
    endpoints: {
      "GET /api/dictionary/word/:word": "获取单词词典数据",
      "POST /api/dictionary/update/:collection": "更新集合所有单词",
      "GET /api/dictionary/stats/:collection": "获取集合统计",
      "GET /api/dictionary/stats": "获取所有集合统计",
      "POST /api/dictionary/word/:collection/:word": "更新单个单词到集合",
      "GET /api/dictionary/health": "健康检查",
    },
    collections: ["cet4", "cet6", "gaokao"],
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error("全局错误:", error);

  res.status(error.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Dictionary API service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `MongoDB URL: ${
      process.env.MONGODB_URL ? "[CONFIGURED]" : "[DEFAULT_CLUSTER]"
    }`
  );
});

module.exports = app;
