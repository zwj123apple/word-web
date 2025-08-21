// scripts/fetchExamples.js
const DictionaryService = require("./services/dictionaryService");

// 四级核心单词列表（示例）
const CET4_CORE_WORDS = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "abroad",
  "absence",
  "absolute",
  "absorb",
  "abstract",
  "abuse",
  "academic",
  "accept",
  "access",
  "accident",
  "accompany",
  "accomplish",
  "accord",
  "account",
  "accurate",
  "accuse",
  "achieve",
  "acquire",
  "across",
  "action",
  // ... 更多单词
];

async function main() {
  //   const service = new DictionaryService(
  //     'mongodb://localhost:27017', // 你的MongoDB连接字符串
  //     'vocabulary_app' // 数据库名
  //   );
  const service = new DictionaryService(
    process.env.MONGODB_URL ||
      "mongodb+srv://test:18QVGiP6oiQbdstd@cluster0.35pzdp4.mongodb.net/word?retryWrites=true&w=majority&appName=Cluster0"
  );
  try {
    await service.connect();

    console.log(`开始处理 ${CET4_CORE_WORDS.length} 个四级核心单词...`);

    const results = await service.processWords(CET4_CORE_WORDS, 8);

    console.log("\n=== 处理结果 ===");
    console.log(`成功: ${results.success} 个单词`);
    console.log(`失败: ${results.failed} 个单词`);

    // 显示详细结果
    console.log("\n=== 详细结果 ===");
    results.details.forEach((detail) => {
      if (detail.status === "success") {
        console.log(`✅ ${detail.word}: 获取到 ${detail.examples} 个例句`);
      } else {
        console.log(`❌ ${detail.word}: ${detail.reason}`);
      }
    });
  } catch (error) {
    console.error("执行失败:", error);
  } finally {
    await service.close();
  }
}

// 运行脚本
if (require.main === module) {
  main();
}
