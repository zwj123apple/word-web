require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接优化 - 避免重复连接
let dbConnection;
const connectDB = async () => {
  if (dbConnection) {
    console.log("使用已存在的数据库连接");
    return dbConnection;
  }
  try {
    console.log("开始连接数据库...");
    const uri = process.env.MONGODB_URI;
    console.log("uri:", uri);
    if (
      !uri ||
      (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
    ) {
      throw new Error("MongoDB URI 格式错误或未配置");
    }
    dbConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 缩短超时时间，快速暴露问题
      bufferCommands: false, // 禁用命令缓冲
    });
    console.log("MongoDB连接成功，数据库名称：", dbConnection.connection.name);
    return dbConnection;
  } catch (err) {
    console.error("MongoDB连接失败:", err.message, "错误码:", err.code);
    throw err;
  }
};

// 健康检查路由
// app.get("/api", (req, res) => {
//   res.send("API正常运行");
// });

const cache = {};

// 核心数据接口
app.get("/api", async (req, res) => {
  try {
    // 确保数据库已连接
    await connectDB();

    const { bank, page = 1, limit = 100 } = req.query;
    if (!bank) {
      return res.status(400).json({ error: "bank参数是必需的" });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: "page和limit必须是正整数" });
    }

    const cacheKey = `${bank}-${pageNum}-${limitNum}`;
    if (cache[cacheKey]) {
      return res.status(200).json({
        data: cache[cacheKey],
        fromCache: true,
      });
    }

    // 验证集合是否存在
    const collectionNames = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionExists = collectionNames.some((col) => col.name === bank);
    if (!collectionExists) {
      return res.status(404).json({ error: `集合 ${bank} 不存在` });
    }

    const collection = mongoose.connection.collection(bank);
    const result = await collection
      .find({})
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    cache[cacheKey] = result;
    setTimeout(() => {
      delete cache[cacheKey];
    }, 3600 * 1000); // 缓存1小时

    res.status(200).json({
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: await collection.countDocuments(),
      },
      fromCache: false,
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    res.status(500).json({
      error: "服务器内部错误",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 本地开发时启动 Express
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`本地服务运行在 http://localhost:${PORT}`);
  });
}

// Vercel 需要导出为 serverless function
module.exports = app;
