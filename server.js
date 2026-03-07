const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Endpoint to upload images
app.post('/api/upload', (req, res) => {
    const { filename, content } = req.body;
    if (!filename || !content) {
        return res.status(400).json({ error: 'Missing filename or content' });
    }

    try {
        const base64Data = content.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filepath = path.join(__dirname, 'img', filename);

        fs.writeFileSync(filepath, buffer);
        console.log(`File uploaded: ${filename}`);
        res.json({ message: 'Upload successful', path: `img/${filename}` });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Endpoint to save configuration files
app.post('/api/save', (req, res) => {
    const { en, ru, ka, images } = req.body;

    if (!en || !ru || !ka || !images) {
        return res.status(400).json({ error: 'Missing data' });
    }

    try {
        fs.writeFileSync(path.join(__dirname, 'data', 'en.json'), JSON.stringify(en, null, 2));
        fs.writeFileSync(path.join(__dirname, 'data', 'ru.json'), JSON.stringify(ru, null, 2));
        fs.writeFileSync(path.join(__dirname, 'data', 'ka.json'), JSON.stringify(ka, null, 2));
        fs.writeFileSync(path.join(__dirname, 'data', 'images.json'), JSON.stringify(images, null, 2));

        console.log('Files saved successfully');
        res.json({ message: 'Files saved successfully' });
    } catch (err) {
        console.error('Error saving files:', err);
        res.status(500).json({ error: 'Failed to save files' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
