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
  if (dbConnection) return dbConnection;
  try {
    dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB连接成功");
    return dbConnection;
  } catch (err) {
    console.error("MongoDB连接失败:", err);
    throw err; // 抛出错误让路由处理
  }
};

// 健康检查路由
app.get("/api", (req, res) => {
  res.send("API正常运行");
});

const cache = {};

// 核心数据接口
app.get("/api/word-data", async (req, res) => {
  try {
    // 确保数据库已连接
    await connectDB();

    // 解析并验证参数
    const { bank, page = 1, limit = 100 } = req.query;
    if (!bank) {
      return res.status(400).json({ error: "bank参数是必需的" });
    }

    // 验证分页参数为数字
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: "page和limit必须是正整数" });
    }

    // 缓存逻辑
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

    // 执行查询
    const collection = mongoose.connection.collection(bank);
    const result = await collection
      .find({})
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    // 设置缓存
    cache[cacheKey] = result;
    setTimeout(() => {
      delete cache[cacheKey];
    }, 3600000); // 1小时缓存

    // 返回结果
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
    // 确保错误时有响应
    res.status(500).json({
      error: "服务器内部错误",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 本地开发启动
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`本地服务运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
