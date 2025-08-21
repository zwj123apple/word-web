const DictionaryService = require("./services/dictionaryService_bak");

module.exports = async (req, res) => {
  console.log("word-data endpoint");
  res.json({ msg: "word-data endpoint ok" });
};
