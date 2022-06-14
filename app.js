import { join } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';
import blend from '@mapbox/blend';
import fetch from 'node-fetch';
import minimist from 'minimist';

const asyncBlend = promisify(blend);
const asyncWriteFile = promisify(writeFile);

const {
  greeting = 'Hello',
  who = 'You',
  width = 400,
  height = 500,
  color = 'Pink',
  size = 100,
} = minimist(process.argv.slice(2));

const options = {
  width,
  height,
  color,
  s: size,
};

const baseUrl = 'https://cataas.com/cat/says/';

const optionsToParam = (params) => new URLSearchParams(params).toString();

const downloadImage = async (uri) => {
  const response = await fetch(uri);
  console.log(`Received response with status:${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const run = async () => {
  try {
    const firstUrl = `${baseUrl}${greeting}?${optionsToParam(options)}`;
    const secondUrl = `${baseUrl}${who}?${optionsToParam(options)}`;

    const [firstImage, secondImage] = await Promise.all([
      downloadImage(firstUrl),
      downloadImage(secondUrl),
    ]);

    const mergedImage = await asyncBlend(
      [
        { buffer: firstImage, x: 0, y: 0 },
        { buffer: secondImage, x: width, y: 0 },
      ],
      { width: width * 2, height, format: 'jpeg' },
    );

    const fileOut = join(process.cwd(), 'cat-card.jpg');
    asyncWriteFile(fileOut, mergedImage).then(() => {
      console.log('The file was saved!');
    });
  } catch (err) {
    console.error('error:', err);
  }
};

run();
