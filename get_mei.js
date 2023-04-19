const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 读取示例 HTML 文件并解析
const $ = cheerio.load(fs.readFileSync(path.resolve(__dirname, 'demo.html')));

// 在页面中查找所需数据
const items = $('.cellex-boom-item-atb-pc-common-card').map((_, element) => {
  const pic =  $(element).find('img.item').attr('src');
  const title = $(element).find('.desc').text().replace(' ',"").replace('\n',"");
  const benifit = $(element).find('.benifit').text();
  const price = $(element).find('.price').text();
  const label = $(element).find('.label').text();
  // const date = new Date($(element).find('time').attr('datetime'));

  return { pic, title, benifit, price, label };
}).get();

console.log(items);
