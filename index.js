import fs from "fs";
import puppeteer from 'puppeteer';

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });

  const page = await browser.newPage();
  await page.goto('https://www.amazon.com/s?k=wireless+gaming+mouse&i=videogames&rh=n%3A402052011%2Cp_n_feature_seventeen_browse-bin%3A75675168011%2Cp_n_feature_eleven_browse-bin%3A23657298011&dc&crid=3K5G53Y9Q2W2G&id=23657290011+&qid=1707143449&sprefix=wire%2Caps%2C204&ref=sr_pg_1');
  await page.setViewport({width: 1535, height: 1024});

  let isBtnDisabled = false;
  while (!isBtnDisabled) {
    await page.waitForSelector('[cel_widget_id="MAIN-SEARCH_RESULTS-2"]')
    const productsHandles = await page.$$(
      "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
    );

    for (const producthandle of productsHandles) {
      let title = "Null";
      let price = "Null";
      let img = "Null";

      try {
        title = await page.evaluate(
          (el) => el.querySelector("h2 > a > span").textContent,
          producthandle
        );
      } catch (error) {}

      try {
        price = await page.evaluate(
          (el) => el.querySelector(".a-price > .a-offscreen").textContent,
          producthandle
        );
      } catch (error) {}

      try {
        img = await page.evaluate(
          (el) => el.querySelector(".s-image").getAttribute("src"),
          producthandle
        );
      } catch (error) {}
      if (title !== "Null") {
        fs.appendFile(
          "results.csv",
          `${title.replace(/,/g, ".")},${price},${img}\n`,
          function (err) {
            if (err) throw err;
          }
        );
      }
    }

    await page.waitForSelector("aria-disabled",{ timeout:0 });
    const is_disabled = (await page.$("span.s-pagination-item.s-pagination-next.s-pagination-disabled")) !== null;

    isBtnDisabled = is_disabled;
    if (!is_disabled) {
      await Promise.all([
        page.click("aria-disabled"),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
  }

  await browser.close();
})();