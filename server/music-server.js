const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const serverApp = express();
const port = 3000;
const mp3Folder = path.join(__dirname, 'music-files');

serverApp.use(cors());

serverApp.get('/', (req, res) => {
  res.send('Welcome to the Music Player API');
});

serverApp.get('/api/files', async(req, res) => {
  try {
    const mm = await import('music-metadata');
    const files = await fs.promises.readdir(mp3Folder);
    const mp3Files = await Promise.all(files
      .filter(file => path.extname(file).toLowerCase() === '.mp3')
      .map(async file => {
        const filePath = path.join(mp3Folder, file);
        const metadata = await mm.parseFile(filePath);
        return {
          name: file,
          artist: metadata.common.artist || 'Unknown Artist',
          title: metadata.common.title || file,
          path: filePath
        };
      })
    );
    res.json(mp3Files);
  } catch (err) {
    console.error('Error reading directory:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

serverApp.get('/api/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(mp3Folder, fileName);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      'Content-Type': 'audio/mpeg',
      'Content-Length': fileSize,
    };
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
});

serverApp.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
