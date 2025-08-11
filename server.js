const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3008;

// Wir speichern die URLs einfach in einem Objekt im Speicher.
// Für ein echtes Projekt würdest du hier eine Datenbank (z.B. MongoDB, PostgreSQL) verwenden.
const urlDatabase = {};

app.use(express.json()); // Erlaubt uns, JSON-Daten vom Frontend zu lesen
app.use(express.static('public')); // Stellt die Dateien im 'public'-Ordner bereit

// API-Endpunkt zum Erstellen einer neuen Kurz-URL
app.post('/shorten', (req, res) => {
    const { originalUrl, animation } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    const shortId = nanoid(7); // Erzeugt eine zufällige, 7-stellige ID
    urlDatabase[shortId] = {
        originalUrl: originalUrl,
        animation: animation || 'default' // Falls keine Animation gewählt wurde
    };

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
    res.json({ shortUrl });
});

// Route für die Weiterleitung
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const urlData = urlDatabase[shortId];

    if (urlData) {
        // Hier wird die Ladeseite mit der Animation angezeigt
        res.send(`
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="3;url=${urlData.originalUrl}">
                <title>Weiterleitung...</title>
                <style>
                    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #2c3e50; font-family: sans-serif; color: white; }
                    .loader-container { text-align: center; }
                    /* --- Animationen --- */
                    ${getAnimationCss(urlData.animation)}
                    .message { margin-top: 20px; font-size: 1.2rem; }
                </style>
            </head>
            <body>
                <div class="loader-container">
                    <div class="loader"></div>
                    <div class="message">Du wirst weitergeleitet...</div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// Funktion, die den CSS-Code für die gewählte Animation zurückgibt
function getAnimationCss(animationName) {
    switch (animationName) {
        case 'spin':
            return `.loader { border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1.5s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        case 'pulse':
            return `.loader { width: 60px; height: 60px; background: #3498db; border-radius: 50%; animation: pulse 1s infinite ease-in-out; } @keyframes pulse { 0% { transform: scale(0); } 100% { transform: scale(1); opacity: 0; } }`;
        case 'dots':
            return `.loader { font-size: 50px; } .loader:after { content: '.'; animation: dots 1.5s steps(5, end) infinite; } @keyframes dots { 0%, 20% { color: rgba(0,0,0,0); text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); } 40% { color: white; text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); } 60% { text-shadow: .25em 0 0 white, .5em 0 0 rgba(0,0,0,0); } 80%, 100% { text-shadow: .25em 0 0 white, .5em 0 0 white; } }`;
        default: // Fallback-Animation
            return `.loader { border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1.5s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    }
}


app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});