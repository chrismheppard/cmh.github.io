const chatIcon = document.getElementById('chatIcon');
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatBody = document.getElementById('chatBody');

chatIcon.addEventListener('click', () => {
  chatWindow.classList.toggle('show');
});

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const userInput = chatInput.value;
  if (userInput.trim() === '') return;

  appendMessage(userInput, 'user');
  chatInput.value = '';

  setTimeout(() => {
    const botResponse = getBotResponse(userInput);
    appendMessage(botResponse, 'bot');
  }, 500);
}

function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', sender);
  messageElement.textContent = message;
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(input) {
  const lowerCaseInput = input.toLowerCase();

  if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi')) {
    return 'Hello there! How can I assist you?';
  } else if (lowerCaseInput.includes('services')) {
    return 'We offer web development, cybersecurity, and cloud solutions. Which one are you interested in?';
  } else if (lowerCaseInput.includes('contact')) {
    return 'You can contact us by filling out the form on our contact page.';
  } else if (lowerCaseInput.includes('games')) {
    return 'You can play Tic-Tac-Toe and a Memory Game on our games page!';
  } else {
    return "I'm sorry, I don't understand. Can you please rephrase your question?";
  }
}
