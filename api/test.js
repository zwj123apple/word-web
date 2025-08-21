// scripts/testConnection.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function testConnection() {
  const mongoUrl =
    process.env.MONGODB_URL ||
    "mongodb+srv://test:18QVGiP6oiQbdstd@cluster0.35pzdp4.mongodb.net/word?retryWrites=true&w=majority&appName=Cluster0";

  console.log("正在测试MongoDB集群连接...");
  console.log("连接字符串:", mongoUrl.replace(/\/\/.*@/, "//***:***@")); // 隐藏密码

  let client;

  try {
    // 创建客户端
    client = new MongoClient(mongoUrl);

    // 连接到集群
    console.log("正在连接到MongoDB集群...");
    await client.connect();
    console.log("✅ 成功连接到MongoDB集群");

    // 获取数据库
    const db = client.db(); // 使用连接字符串中指定的数据库
    console.log(`✅ 连接到数据库: ${db.databaseName}`);

    // 测试ping
    await db.admin().ping();
    console.log("✅ 数据库ping测试成功");

    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log(`\n📚 发现 ${collections.length} 个集合:`);
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    // 检查目标集合
    const targetCollections = ["cet4", "cet6", "gaokao"];
    console.log("\n🎯 检查目标集合:");

    for (const collectionName of targetCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`  ✅ ${collectionName}: ${count} 个文档`);

        // 显示一个示例文档结构
        if (count > 0) {
          const sample = await collection.findOne();
          console.log(
            `     示例文档结构: ${JSON.stringify(Object.keys(sample), null, 2)}`
          );
        }
      } catch (error) {
        console.log(`  ❌ ${collectionName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ 连接失败:", error.message);

    if (error.message.includes("authentication failed")) {
      console.error("🔐 认证失败，请检查用户名和密码");
    } else if (error.message.includes("network")) {
      console.error("🌐 网络连接问题，请检查网络和防火墙设置");
    } else if (error.message.includes("timeout")) {
      console.error("⏰ 连接超时，请检查网络连接");
    }

    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔚 连接已关闭");
    }
  }
}

// 测试DictionaryService类
async function testDictionaryService() {
  console.log("\n" + "=".repeat(50));
  console.log("测试 DictionaryService 类");
  console.log("=".repeat(50));

  const DictionaryService = require("../services/dictionaryService");
  const service = new DictionaryService(
    process.env.MONGODB_URL ||
      "mongodb+srv://test:18QVGiP6oiQbdstd@cluster0.35pzdp4.mongodb.net/word?retryWrites=true&w=majority&appName=Cluster0"
  );

  try {
    await service.connect();
    console.log("✅ DictionaryService 连接成功");

    // 测试获取统计信息
    const collections = ["cet4", "cet6", "gaokao"];
    for (const collection of collections) {
      try {
        const stats = await service.getCollectionStats(collection);
        console.log(`📊 ${collection} 统计:`, stats);
      } catch (error) {
        console.log(`❌ ${collection} 统计获取失败:`, error.message);
      }
    }

    // 测试API调用
    console.log("\n🧪 测试Dictionary API...");
    const testResult = await service.fetchWordFromAPI("test");
    console.log("API测试结果:", {
      word: testResult.word,
      found: testResult.found,
      examplesCount: testResult.examples?.length || 0,
      definitionsCount: testResult.definitions?.length || 0,
    });
  } catch (error) {
    console.error("❌ DictionaryService 测试失败:", error.message);
  } finally {
    await service.close();
  }
}

async function main() {
  await testConnection();
  await testDictionaryService();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, testDictionaryService };
