const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// 定义 mongoose 数据模型
const GoodSchema = new mongoose.Schema({
  title: String,
  type: String,
  pic: String,
  price: Number,
  fire: String,
  label: String,
  createdAt: Date,
});

const Good = mongoose.model("tao-ornament", GoodSchema);

const pathArr = [
  {
    name: "项链",
    path: "./getNecklace/index.html",
    type: "necklace",
  },
  {
    name: "耳环",
    path: "./getEarring/index.html",
    type: "earring",
  },
  {
    name: "耳钉",
    path: "./getStud/index.html",
    type: "stud",
  },
  {
    name: "手链",
    path: "./getBracelet/index.html",
    type: "bracelet",
  },
  {
    name: "胸针",
    path: "./getBrooch/index.html",
    type: "brooch",
  },
  {
    name: "戒指",
    path: "./getRing/index.html",
    type: "ring",
  },
  {
    name: "手镯",
    path: "./getBangle/index.html",
    type: "bangle",
  },
  {
    name: "发饰",
    path: "./getHairJewelry/index.html",
    type: "hairJewelry",
  },
  {
    name: "耳夹",
    path: "./getEarClip/index.html",
    type: "earClip",
  },
];

const dataArr = pathArr.map((item) => {
  // 读取示例 HTML 文件并解析
  const $ = cheerio.load(fs.readFileSync(path.resolve(__dirname, item.path)));

  // 在页面中查找所需数据
  const items = $(".item")
    .map((_, element) => {
      const pic = $(element).find("img.J_ItemPic").attr("src");
      const title = $(element).find(".J_ClickStat").text().replace(/\s+/g, "");
      const price = $(element)
        .find(".price")
        .text()
        .replace("¥", "")
        .replace(/\s+/g, "");
      const label = $(element).find(".deal-cnt").text().replace("人付款", "");
      const shopname = $(element).find(".shopname").text().replace(/\s+/g, "");
      const address = $(element).find(".location").text();
      const type = item.type;
      const createdAt = new Date();
      return {
        title,
        type,
        pic,
        price,
        shopname,
        address,
        label,
        createdAt,
      };
    })
    .get();

  // console.log("items", items)
  console.log("AAA", items[0]);
  console.log("长度：", items.length);
  return items;
});

// 将数据存储到 MongoDB 数据库中
mongoose.connect("mongodb://127.0.0.1:27017/low-code", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to database.");
  Good.insertMany(dataArr.flat())
    .then((e) => {
      console.log("Inserted");
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      console.log("End!!!");
      db.close();
    });
});
