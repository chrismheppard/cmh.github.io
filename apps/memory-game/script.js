const cards = document.querySelectorAll('.card');
const gameGrid = document.querySelector('#memory-game-board');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

const cardValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const gameCards = [...cardValues, ...cardValues];

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  shuffle(gameCards);
  gameCards.forEach(value => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = value;

    const frontFace = document.createElement('div');
    frontFace.classList.add('front-face');
    frontFace.textContent = '?';

    const backFace = document.createElement('div');
    backFace.classList.add('back-face');
    backFace.textContent = value;

    card.appendChild(frontFace);
    card.appendChild(backFace);

    gameGrid.appendChild(card);
    card.addEventListener('click', flipCard);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.value === secondCard.dataset.value;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

createBoard();
