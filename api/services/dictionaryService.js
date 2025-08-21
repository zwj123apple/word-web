// services/dictionaryService.js
const axios = require("axios");
const { MongoClient } = require("mongodb");

class DictionaryService {
  constructor(mongoUrl, dbName = null) {
    this.mongoUrl = mongoUrl;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUrl);
      await this.client.connect();

      // 如果连接字符串包含数据库名，使用它；否则使用传入的dbName
      if (this.dbName) {
        this.db = this.client.db(this.dbName);
      } else {
        // 从连接字符串中提取数据库名
        const dbNameFromUrl = this.extractDbNameFromUrl(this.mongoUrl);
        this.db = this.client.db(dbNameFromUrl);
      }
    }
  }

  extractDbNameFromUrl(url) {
    try {
      // 匹配 MongoDB 连接字符串中的数据库名
      // 格式: mongodb+srv://user:pass@cluster.xxx.mongodb.net/dbname?options
      const match = url.match(/\/([^/?]+)(\?|$)/);
      if (match && match[1]) {
        return match[1];
      }
      // 如果没有找到，返回默认名称
      return "word";
    } catch (error) {
      console.warn("无法从URL提取数据库名，使用默认值:", error.message);
      return "word";
    }
  }

  async fetchWordFromAPI(word) {
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        { timeout: 8000 }
      );

      return this.parseApiResponse(response.data, word);
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          word: word.toLowerCase(),
          found: false,
          error: "Word not found in dictionary",
        };
      }
      throw new Error(`API请求失败: ${error.message}`);
    }
  }

  parseApiResponse(data, word) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        word: word.toLowerCase(),
        found: false,
        error: "No data returned from API",
      };
    }

    const wordData = data[0];
    const examples = [];
    const definitions = [];
    const phonetics = [];

    // 提取音标
    wordData.phonetics?.forEach((phon) => {
      if (phon.text) {
        phonetics.push({
          text: phon.text,
          audio: phon.audio || null,
        });
      }
    });

    // 提取定义和例句
    wordData.meanings?.forEach((meaning) => {
      meaning.definitions?.forEach((def) => {
        if (def.definition) {
          definitions.push({
            definition: def.definition,
            partOfSpeech: meaning.partOfSpeech,
            synonyms: def.synonyms || [],
            antonyms: def.antonyms || [],
          });
        }

        if (def.example) {
          examples.push({
            sentence: def.example,
            partOfSpeech: meaning.partOfSpeech,
            source: "dictionary_api",
            difficulty: this.estimateDifficulty(def.example),
            length: def.example.length,
          });
        }
      });
    });

    return {
      word: word.toLowerCase(),
      found: true,
      phonetics: phonetics.slice(0, 3), // 最多3个音标
      definitions: definitions.slice(0, 5), // 最多5个定义
      examples: this.filterQualityExamples(examples).slice(0, 8), // 最多8个例句
      source: "dictionary_api",
      fetchedAt: new Date(),
    };
  }

  estimateDifficulty(sentence) {
    const length = sentence.length;
    const wordCount = sentence.split(" ").length;

    if (length < 30 || wordCount < 6) return "easy";
    if (length < 80 || wordCount < 12) return "medium";
    return "hard";
  }

  filterQualityExamples(examples) {
    return examples
      .filter((example) => {
        const sentence = example.sentence;
        return (
          sentence.length >= 10 &&
          sentence.length <= 200 &&
          !sentence.includes("http") &&
          !sentence.includes("www.") &&
          !/^\d+\./.test(sentence) && // 不以数字开头
          sentence.split(" ").length >= 3
        ); // 至少3个单词
      })
      .sort((a, b) => {
        // 优先选择中等长度的例句
        const optimalLength = 50;
        const aDiff = Math.abs(a.sentence.length - optimalLength);
        const bDiff = Math.abs(b.sentence.length - optimalLength);
        return aDiff - bDiff;
      });
  }

  async updateWordInDB(collectionName, word, wordData) {
    await this.connect();
    const collection = this.db.collection(collectionName);

    const updateData = {
      updatedAt: new Date(),
    };

    if (wordData.found) {
      updateData.phonetics = wordData.phonetics;
      updateData.definitions = wordData.definitions;
      updateData.examples = wordData.examples;
      updateData.source = wordData.source;
      updateData.fetchedAt = wordData.fetchedAt;
      updateData.hasExamples = wordData.examples.length > 0;
    } else {
      updateData.fetchError = wordData.error;
      updateData.hasExamples = false;
    }

    await collection.updateOne(
      { word: word.toLowerCase() },
      { $set: updateData },
      { upsert: false } // 不创建新文档，只更新存在的
    );

    return updateData;
  }

  async getAllWordsFromCollection(collectionName) {
    await this.connect();
    const collection = this.db.collection(collectionName);
    return await collection.find({}, { word: 1, _id: 0 }).toArray();
  }

  async batchUpdateCollection(collectionName, batchSize = 10, delayMs = 1000) {
    const words = await this.getAllWordsFromCollection(collectionName);
    const totalWords = words.length;

    const results = {
      total: totalWords,
      processed: 0,
      success: 0,
      failed: 0,
      details: [],
      startTime: new Date(),
    };

    console.log(`开始处理 ${collectionName} 集合，共 ${totalWords} 个单词`);

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(words.length / batchSize);

      console.log(
        `处理批次 ${batchNum}/${totalBatches}: ${batch
          .map((w) => w.word)
          .join(", ")}`
      );

      await Promise.all(
        batch.map(async (wordDoc) => {
          const word = wordDoc.word;
          try {
            const wordData = await this.fetchWordFromAPI(word);
            await this.updateWordInDB(collectionName, word, wordData);

            results.processed++;
            if (wordData.found && wordData.examples.length > 0) {
              results.success++;
              results.details.push({
                word,
                status: "success",
                examples: wordData.examples.length,
                definitions: wordData.definitions.length,
              });
            } else {
              results.failed++;
              results.details.push({
                word,
                status: "no_data",
                error: wordData.error || "无例句",
              });
            }
          } catch (error) {
            results.processed++;
            results.failed++;
            results.details.push({
              word,
              status: "error",
              error: error.message,
            });
            console.error(`处理单词 ${word} 出错:`, error.message);
          }
        })
      );

      // 进度报告
      const progress = ((results.processed / totalWords) * 100).toFixed(1);
      console.log(
        `进度: ${progress}% (${results.processed}/${totalWords}), 成功: ${results.success}, 失败: ${results.failed}`
      );

      // 延迟以避免API限制
      if (i + batchSize < words.length) {
        await this.delay(delayMs);
      }
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    return results;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getCollectionStats(collectionName) {
    await this.connect();
    const collection = this.db.collection(collectionName);

    const total = await collection.countDocuments();
    const withExamples = await collection.countDocuments({ hasExamples: true });
    const withoutExamples = await collection.countDocuments({
      hasExamples: false,
    });
    const withErrors = await collection.countDocuments({
      fetchError: { $exists: true },
    });

    return {
      collection: collectionName,
      total,
      withExamples,
      withoutExamples,
      withErrors,
      coverageRate:
        total > 0 ? ((withExamples / total) * 100).toFixed(2) + "%" : "0%",
    };
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

module.exports = DictionaryService;
