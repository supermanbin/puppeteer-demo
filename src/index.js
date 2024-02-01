const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const WIDTH = 1920;
const HEIGHT = 1080;

(async () => {
  //  启动浏览器
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT
    }
  });
  //  打开新页面
  const page = await browser.newPage();
  //  设置浏览器视窗大小
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  // 访问网站
  await page.goto('https://mall.icbc.com.cn/products/pd_9003867817.jhtml');
  // 获取页面元素
  const imgSku = await page.waitForSelector('#img_sku');
  // 模拟点击事件
  await imgSku.$eval('em[value="规格_100g"]', e => {
    e.click();
  });
  // 获取元素的内容
  const priceCurrencyType = await page.$eval(
    '#priceCurrencyType',
    e => e.textContent
  );
  const prodPrice = await page.$eval('#prodPrice', e => e.textContent);
  // 销毁
  await imgSku.dispose();
  // 关闭浏览器
  await browser.close();

  const csvFile = path.resolve(__dirname, '../assets', 'test.csv');
  const datas = [];

  // fs.createReadStream(csvFile)
  //   .pipe(csv.parse({ headers: false }))
  //   .on('error', error => console.error(error))
  //   .on('data', row => {
  //     console.log('--------------------------->', row);
  //     // datas.push(row);
  //   })
  //   .on('end', rowCount => {
  //
  //   });

  csv
    .writeToStream(
      fs.createWriteStream(csvFile, {
        flags: 'a',
        includeEndRowDelimiter: true,
        escape: '"',
        delimiter: '\n'
      }),
      [
        {
          Date: new Date().toLocaleDateString(),
          Price: prodPrice
        }
      ],
      {
        headers: false,
        encoding: 'utf-8'
      }
    )
    .on('error', error => console.error(error))
    .on('finish', () => {
      console.log('=================== 写入完成 =======================');
      console.log(datas);
      process.exit();
    });
})();
