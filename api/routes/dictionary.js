// routes/dictionary.js
const express = require("express");
const router = express.Router();
const DictionaryService = require("../services/dictionaryService");

// 初始化服务 - 集群连接字符串已包含数据库名
const dictionaryService = new DictionaryService(
  process.env.MONGODB_URL ||
    "mongodb+srv://test:18QVGiP6oiQbdstd@cluster0.35pzdp4.mongodb.net/word?retryWrites=true&w=majority&appName=Cluster0"
);

// 中间件：验证集合名称
const validateCollection = (req, res, next) => {
  const validCollections = ["cet4", "cet6", "gaokao"];
  const { collection } = req.params;

  if (collection && !validCollections.includes(collection)) {
    return res.status(400).json({
      success: false,
      error: "Invalid collection. Must be one of: cet4, cet6, gaokao",
    });
  }

  next();
};

// API 1: 获取单个单词的词典数据
router.get("/word/:word", async (req, res) => {
  try {
    const { word } = req.params;

    if (!word || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Word parameter is required",
      });
    }

    const wordData = await dictionaryService.fetchWordFromAPI(word.trim());

    res.json({
      success: true,
      data: wordData,
    });
  } catch (error) {
    console.error("获取单词数据出错:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// API 2: 更新指定集合的所有单词数据
router.post("/update/:collection", validateCollection, async (req, res) => {
  try {
    const { collection } = req.params;
    const { batchSize = 10, delayMs = 1000 } = req.body;

    // 验证参数
    if (batchSize < 1 || batchSize > 50) {
      return res.status(400).json({
        success: false,
        error: "batchSize must be between 1 and 50",
      });
    }

    if (delayMs < 500 || delayMs > 5000) {
      return res.status(400).json({
        success: false,
        error: "delayMs must be between 500 and 5000",
      });
    }

    // 启动后台更新任务
    res.json({
      success: true,
      message: `Started updating ${collection} collection`,
      params: { batchSize, delayMs },
    });

    // 异步执行更新
    dictionaryService
      .batchUpdateCollection(collection, batchSize, delayMs)
      .then((results) => {
        console.log(`${collection} 集合更新完成:`, {
          total: results.total,
          success: results.success,
          failed: results.failed,
          duration: `${Math.round(results.duration / 1000)}秒`,
        });
      })
      .catch((error) => {
        console.error(`${collection} 集合更新失败:`, error);
      });
  } catch (error) {
    console.error("启动更新任务出错:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// API 3: 获取集合统计信息
router.get("/stats/:collection", validateCollection, async (req, res) => {
  try {
    const { collection } = req.params;
    const stats = await dictionaryService.getCollectionStats(collection);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("获取统计信息出错:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// API 4: 获取所有集合的统计信息
router.get("/stats", async (req, res) => {
  try {
    const collections = ["cet4", "cet6", "gaokao"];
    const allStats = await Promise.all(
      collections.map((col) => dictionaryService.getCollectionStats(col))
    );

    res.json({
      success: true,
      data: allStats,
    });
  } catch (error) {
    console.error("获取所有统计信息出错:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// API 5: 更新单个单词到指定集合
router.post("/word/:collection/:word", validateCollection, async (req, res) => {
  try {
    const { collection, word } = req.params;

    if (!word || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Word parameter is required",
      });
    }

    // 获取词典数据
    const wordData = await dictionaryService.fetchWordFromAPI(word.trim());

    // 更新到数据库
    const updateResult = await dictionaryService.updateWordInDB(
      collection,
      word.trim(),
      wordData
    );

    res.json({
      success: true,
      data: {
        word: word.toLowerCase(),
        collection,
        wordData,
        updateResult,
      },
    });
  } catch (error) {
    console.error("更新单词出错:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// API 6: 健康检查
router.get("/health", async (req, res) => {
  try {
    await dictionaryService.connect();
    res.json({
      success: true,
      message: "Dictionary service is healthy",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: "Service unavailable",
      message: error.message,
    });
  }
});

// 优雅关闭连接
process.on("SIGINT", async () => {
  console.log("正在关闭数据库连接...");
  await dictionaryService.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("正在关闭数据库连接...");
  await dictionaryService.close();
  process.exit(0);
});

module.exports = router;
