// scripts/fetchExamples.js
const DictionaryService = require("./services/dictionaryService");

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
    // 测试获取统计信息
    const collections = ["gaokao"];
    // for (const collection of collections) {
    //   try {
    //     const words = await service.getAllWordsFromCollection(collection);
    //     for (w of words) {
    //       const wordData = await service.fetchWordFromAPI(w.word);
    //       const sentence = wordData.examples[0].sentence;

    //       break;
    //     }
    //   } catch (error) {
    //     console.log(`❌ ${collection} 统计获取失败:`, error.message);
    //   }
    //   break;
    // }
    for (const collection of collections) {
      try {
        await service.batchUpdateCollection(collection);
      } catch (error) {
        console.log(`❌ ${collection} 统计获取失败:`, error.message);
      }
      break;
    }
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
