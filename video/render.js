// renders promo.html to mp4: pauses every animation, seeks frame by frame, screenshots,
// pipes the frames into ffmpeg with the synthesised soundtrack.
//   node render.js                      -> out/stay-promo.mp4 (+ a silent and a no-woof cut)
//   SITE=https://stay.dog node render.js -> same, with that address on the bar
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import ffmpeg from 'ffmpeg-static';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out');
mkdirSync(out, { recursive: true });
const FPS = 30, W = 1080, H = 1350;
const page_url = 'file://' + path.join(here, 'promo.html') + (process.env.SITE ? '?site=' + encodeURIComponent(process.env.SITE) : '');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(page_url, { waitUntil: 'networkidle0' });
await page.evaluate(() => window.ready);
const dur = await page.evaluate(() => window.STAY_CUES.dur);

const tracks = {
  full: { music: true, woof: true },
  'no-woof': { music: true, woof: false },
};
for (const [name, opts] of Object.entries(tracks)) {
  const b64 = await page.evaluate((o) => window.makeSound(o), opts);
  writeFileSync(path.join(out, `sound-${name}.wav`), Buffer.from(b64, 'base64'));
}

// pictures first, into a silent master
const silent = path.join(out, 'stay-promo-silent.mp4');
const enc = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'ignore', 'inherit'] });
const frames = Math.round(dur * FPS);
const clip = { x: 0, y: 0, width: W, height: H };
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.seek(t), i / FPS);
  const png = await page.screenshot({ type: 'png', clip });
  if (!enc.stdin.write(png)) await new Promise((r) => enc.stdin.once('drain', r));
  if (i % 60 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
}
enc.stdin.end();
await new Promise((r, j) => enc.on('close', (c) => (c ? j(new Error('ffmpeg ' + c)) : r())));
await browser.close();

// then lay each soundtrack under it
for (const [name, file] of [['', 'full'], ['-no-woof', 'no-woof']]) {
  await new Promise((r, j) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(out, `sound-${file}.wav`),
    '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(out, `stay-promo${name}.mp4`)], { stdio: 'inherit' })
    .on('close', (c) => (c ? j(new Error('mux ' + c)) : r())));
}
console.log('done ->', out);
