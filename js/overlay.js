// js/overlay.js

function showOverlay(message, restartCallback) {
    let overlay = document.getElementById('game-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.classList.add('overlay-container');
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="overlay-content">
            <p id="overlay-message">${message}</p>
            <button id="overlay-restart-button" class="cta-button">Play Again</button>
        </div>
    `;

    overlay.style.display = 'flex';

    const restartButton = document.getElementById('overlay-restart-button');
    restartButton.addEventListener('click', () => {
        hideOverlay();
        if (typeof restartCallback === 'function') {
            restartCallback();
        }
    });
}

function hideOverlay() {
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
