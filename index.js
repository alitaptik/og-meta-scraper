const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parametresi gerekli' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      const getMeta = (prop) =>
        document.querySelector(`meta[property="${prop}"]`)?.content || null;

      return {
        title: getMeta('og:title'),
        image: getMeta('og:image'),
        canonical: document.querySelector('link[rel="canonical"]')?.href || null
      };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Scraper ${PORT} portunda çalışıyor`);
});
