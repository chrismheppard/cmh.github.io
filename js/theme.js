document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const trippyThemeLink = document.createElement('link');
    trippyThemeLink.rel = 'stylesheet';
    
    // Adjust path based on how deep the file is nested
    const pathPrefix = document.body.dataset.pathPrefix || '';
    trippyThemeLink.href = `${pathPrefix}css/trippy.css`;

    // Function to apply theme based on selection
    function applyTheme(theme) {
        if (theme === 'trippy') {
            document.body.classList.add('trippy-theme');
            if (!document.querySelector(`link[href="${pathPrefix}css/trippy.css"]`)) {
                document.head.appendChild(trippyThemeLink);
            }
        } else {
            document.body.classList.remove('trippy-theme');
            const existingLink = document.querySelector(`link[href="${pathPrefix}css/trippy.css"]`);
            if (existingLink) {
                document.head.removeChild(existingLink);
            }
        }
    }

    // Apply saved theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Toggle theme on button click
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'trippy') {
                localStorage.removeItem('theme');
                applyTheme('default');
            } else {
                localStorage.setItem('theme', 'trippy');
                applyTheme('trippy');
            }
        });
    }
});
