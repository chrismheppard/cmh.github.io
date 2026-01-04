document.addEventListener('DOMContentLoaded', () => {
    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.className = 'app-overlay';

    // Create the "Back to Dashboard" button
    const backButton = document.createElement('a');
    backButton.href = '../../apps.html';
    backButton.className = 'cta-button';
    backButton.textContent = 'Back to Dashboard';

    // Create the theme toggle button
    const themeToggleButton = document.createElement('button');
    themeToggleButton.id = 'theme-toggle-button';
    themeToggleButton.className = 'cta-button';
    themeToggleButton.textContent = 'Change Theme';

    // Append buttons to the overlay
    overlay.appendChild(backButton);
    overlay.appendChild(themeToggleButton);

    // Append the overlay to the body
    document.body.appendChild(overlay);
});
