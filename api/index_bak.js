// 加载环境变量
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Data = require('./data.js'); // 导入我们的数据模型

const app = express();

// --- 中间件 ---
// 允许所有来源的跨域请求，Vercel部署需要
app.use(cors());
// 解析JSON请求体
app.use(express.json());

// --- 数据库连接 ---
// process.env.MONGODB_URI 会从.env文件或Vercel环境变量中读取
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('成功连接到 MongoDB Atlas'))
  .catch(err => console.error('连接 MongoDB 失败:', err));

// --- API 路由 ---
// 定义一个根路由，用于健康检查
app.get('/api', (req, res) => {
  res.send('你好，这里是后端API！');
});

// **核心：获取数据的API端点，支持分页**
app.get('/api/data', async (req, res) => {
  try {
    // 从查询参数获取分页信息，并设置默认值
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30; // 默认每页30条
    const sourceFile = req.query.source; // 允许按文件名筛选，例如 /api/data?source=file1

    // 构建查询条件
    const query = {};
    if (sourceFile) {
      query.source = sourceFile;
    }

    const skip = (page - 1) * limit;

    // 查询数据库
    const data = await Data.find(query).skip(skip).limit(limit);
    
    // 获取总记录数用于前端计算总页数
    const total = await Data.countDocuments(query);

    res.status(200).json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: '获取数据失败', error: error.message });
  }
});

// --- 导出Express App供Vercel使用 ---
// Vercel会自动处理监听端口，所以我们不需要app.listen()
module.exports = app;