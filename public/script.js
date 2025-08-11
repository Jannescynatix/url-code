document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shorten-form');
    const resultDiv = document.getElementById('result');
    const shortUrlOutput = document.getElementById('short-url-output');
    const copyButton = document.getElementById('copy-button');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalUrl = document.getElementById('url-input').value;
        const animation = document.getElementById('animation-select').value;

        try {
            const response = await fetch('/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ originalUrl, animation }),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Kürzen der URL.');
            }

            const data = await response.json();
            shortUrlOutput.value = data.shortUrl;
            resultDiv.classList.remove('hidden');

        } catch (error) {
            alert(error.message);
        }
    });

    copyButton.addEventListener('click', () => {
        shortUrlOutput.select();
        document.execCommand('copy');
        copyButton.textContent = 'Kopiert!';
        setTimeout(() => {
            copyButton.textContent = 'Kopieren';
        }, 2000);
    });
});