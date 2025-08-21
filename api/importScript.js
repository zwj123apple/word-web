require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// 要导入的JSON文件（文件名对应未来的集合名）
//const filesToImport = ['cet4.json', 'cet6.json', 'gaokao.json'];
const filesToImport = ["gaokao.json"];

// 通用的导入函数
const importData = async () => {
  try {
    // 1. 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("成功连接到 MongoDB");

    // 2. 循环处理每个文件
    for (const fileName of filesToImport) {
      // 集合名：去掉扩展名（如 'cet4.json' → 'cet4'）
      const collectionName = fileName.split(".")[0];
      const filePath = path.join(__dirname, "data", fileName); // 假设文件在/data目录下

      // 读取JSON文件内容
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      // 3. 获取或创建集合（不存在则自动创建）
      const collection = mongoose.connection.collection(collectionName);

      // 可选：清空该集合的旧数据（防止重复导入）
      await collection.deleteMany({});
      console.log(`已清空集合 ${collectionName} 的旧数据`);

      // 4. 导入数据（根据JSON结构处理）
      if (Array.isArray(jsonData)) {
        // 如果JSON是数组（多条记录）
        await collection.insertMany(jsonData);
        console.log(`已将 ${jsonData.length} 条数据导入集合 ${collectionName}`);
      } else {
        // 如果JSON是单个对象（单条记录）
        await collection.insertOne(jsonData);
        console.log(`已将 1 条数据导入集合 ${collectionName}`);
      }
    }

    console.log("所有文件导入完成！");
  } catch (error) {
    console.error("导入失败:", error);
  } finally {
    // 5. 关闭连接
    await mongoose.connection.close();
    console.log("数据库连接已关闭");
  }
};

// 执行导入
importData();
