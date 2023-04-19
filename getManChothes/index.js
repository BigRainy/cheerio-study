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

const Good = mongoose.model("tao-goods", GoodSchema);

const pathArr = [
  {
    name: "棉衣",
    path: "./getCoat/index.html",
    type: "coat",
  },
  {
    name: "羽绒服",
    path: "./getDownJacket/index.html",
    type: "downJacket",
  },
  {
    name: "夹克",
    path: "./getJacket/index.html",
    type: "jacket",
  },
  {
    name: "皮衣",
    path: "./getLeather/index.html",
    type: "leather",
  },
  {
    name: "polo衫",
    path: "./getPolo/index.html",
    type: "polo",
  },
  {
    name: "衬衫",
    path: "./getShirt/index.html",
    type: "shirt",
  },
  {
    name: "毛衣",
    path: "./getSweater/index.html",
    type: "sweather",
  },
  {
    name: "卫衣",
    path: "./getSweatshirt/index.html",
    type: "sweatshirt",
  },
  {
    name: "T恤",
    path: "./getTShirt/index.html",
    type: "t-shirt",
  },
  {
    name: "风衣",
    path: "./getWindbreak/index.html",
    type: "windbreak",
  },
];

const dataArr = pathArr.map((item) => {
  // 读取示例 HTML 文件并解析
  const $ = cheerio.load(fs.readFileSync(path.resolve(__dirname, item.path)));

  // 在页面中查找所需数据
  const items = $(".cellex-boom-item-atb-pc-common-card")
    .map((_, element) => {
      const pic = $(element).find("img.item").attr("src");
      const title = $(element).find(".desc").text().replace(/\s+/g, "");
      const fire = $(element).find(".benifit").text();
      const price = $(element)
        .find(".price")
        .text()
        .replace("¥", "")
        .replace(/\s+/g, "");
      const label = $(element).find(".label").text().replace("月销 ", "");
      const type = item.type;
      const createdAt = new Date();
      return { title, type, pic, fire, price, label, createdAt };
    })
    .get();

  // console.log("items", items)
  // console.log("AAA", items[0]);
  // console.log("长度：", items.length);
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
