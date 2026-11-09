import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

const URL = 'http://localhost:8788/index.html';
const OUT = 'a:\\cursor_PMO\\PMO-Slides.pdf';
const W = 1920, H = 1080;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(2000);

  await page.addStyleTag({ content: '#nav{display:none!important}' });

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  const pdf = await PDFDocument.create();

  for (let i = 0; i < total; i++) {
    // переход на слайд i через штатную навигацию
    await page.evaluate(n => goTo(n), i);
    await sleep(900);

    const current = await page.evaluate(() => cur);
    if (current !== i) throw new Error(`Ожидался слайд ${i + 1}, открыт ${current + 1}`);

    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
    const img = await pdf.embedPng(png);
    const p = pdf.addPage([W, H]);
    p.drawImage(img, { x: 0, y: 0, width: W, height: H });
    console.log(`Слайд ${i + 1}/${total} добавлен`);
  }

  await browser.close();
  const bytes = await pdf.save();
  writeFileSync(OUT, bytes);
  console.log(`PDF: ${OUT}, страниц: ${total}, ${Math.round(bytes.length / 1024)} КБ`);
})();
