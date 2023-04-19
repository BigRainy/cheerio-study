const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');

// 定义 mongoose 数据模型
const ItemSchema = new mongoose.Schema({
  title: String,
  link: String,
  date: Date,
});

const Item = mongoose.model('Item', ItemSchema);

// 循环爬取数据并存储到数据库中
const intervalId = setInterval(() => {
  // 爬取页面数据并解析
  axios.get('https://s.taobao.com/search?spm=a21bo.jianhua.201867-main.10.6bc011d9Ohm3LX&q=%E7%94%B7%E8%A3%85').then((response) => {
    const $ = cheerio.load(response.data);

    // 在页面中查找所需数据
    const items = $('div.item').map((_, element) => {
      const pic=$(element).find('h2').text();
      const title = $(element).find('h2').text();
      const link = $(element).find('a').attr('href');
      const date = new Date($(element).find('time').attr('datetime'));

      return { title, link, date };
    }).get();

    // 将数据存储到 MongoDB 数据库中
    mongoose.connect('mongodb://localhost:27017/low-code', { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('Connected to database.');

      Item.insertMany(items, (error, docs) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Inserted', docs.length, 'documents.');
        }

        db.close();
      });
    });
  }).catch((error) => {
    console.error(error);
  });
}, 1000 * 60 * 60); // 每小时爬取一次

// 在程序结束时清除定时器
process.on('SIGINT', () => {
  clearInterval(intervalId);
  process.exit();
});
