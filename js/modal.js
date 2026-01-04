document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const modal = document.getElementById('newsletterModal');
    const openBtn = document.getElementById('subscribeBtn');
    const closeBtn = document.querySelector('.close-button');

    // Open modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal with the close button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal by clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
