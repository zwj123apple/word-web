const mongoose = require('mongoose');

// 定义一个非常灵活的Schema来匹配你任意结构的JSON数据
const DataSchema = new mongoose.Schema({
  // 我们不知道JSON的具体结构，所以使用一个可以存储任何东西的字段
  // 如果你的JSON结构是固定的，强烈建议在这里定义详细的字段和类型
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // 可以增加一个字段来区分你的3个文件，比如 file1, file2, file3
  source: {
    type: String,
    required: true,
    index: true, // 为source字段创建索引，加快查询速度
  },
}, { timestamps: true }); // timestamps会自动添加createdAt和updatedAt字段

// 创建并导出模型
// Mongoose会自动将'Data'转换为复数形式'data'作为集合名称
module.exports = mongoose.model('Data', DataSchema);