let keyboardEL = document.querySelector('#keyboard');
let deleteEL = document.querySelector('#delete');
let enterEL = document.querySelector('#enter');
let restartEL = document.querySelector('#restart');
let secretEL = document.querySelector('#secret');
let rulesEL = document.querySelector('#rules');
let rulesBtnEL = document.querySelector('#rules-btn');
let boxesEL = document.querySelectorAll('#board .box');

let alphabet = new Set('qwertyuiopasdfghjklzxcvbnm'.split(''));

let stage; // going win fail
let secretWord;
let attempts;
let currentInput;

try {
  stage = getSaved('stage') || 'going';
  secretWord = getSaved('secretWord') || getRandomWord();
  attempts = getSaved('attempts') || [];
  currentInput = [];

  firstRender();

  rulesBtnEL.addEventListener('click', () => {
    if (rulesEL.style.display) {
      rulesEL.style.display = '';
      rulesBtnEL.innerHTML = 'Ok, close the rules';
    } else {
      rulesEL.style.display = 'none';
      rulesBtnEL.innerHTML = 'How to play?';
    }
  });
  restartEL.addEventListener('click', () => startNewGame());

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      if (stage === 'win' || stage === 'fail') {
        startNewGame();
      } else {
        submitWord();
      }
    } else if (ev.key === 'Backspace') {
      removeLetter();
    } else if (alphabet.has(ev.key.toLowerCase())) {
      printLetter(ev.key);
    }
  });

  keyboardEL.addEventListener('click', (ev) => {
    if (ev.target.nodeName === 'BUTTON') {
      if (ev.target === deleteEL) {
        removeLetter();
      } else if (ev.target === enterEL) {
        submitWord();
      } else {
        printLetter(ev.target.innerText);
      }
    }
  });

} catch (err) {
  console.error(err);
  localStorage.clear();
  alert('Something went wrong:(\nPlease try refreshing the page');
}

function paintOverKeyboardKey(letter, color) {
  let keyboardLetter = document.querySelector(`#letter-${letter.toLowerCase()}`);
  if (color === 'green') {
    keyboardLetter.dataset.color = 'green';
  } else if (color === 'yellow' && keyboardLetter.dataset.color !== 'green') {
    keyboardLetter.dataset.color = 'yellow';
  } else if (color === 'grey' && !keyboardLetter.dataset.color) {
    keyboardLetter.dataset.color = 'grey';
  }
}

function printLetter(letter) {
  if (stage === 'going' && currentInput.length < 5) {
    currentInput.push(letter.toLowerCase());
    boxesEL[attempts.length * 5 + currentInput.length - 1].innerHTML = letter.toUpperCase();

    toggleButtons();
  }
}

function removeLetter() {
  if (stage === 'going' && currentInput.length > 0) {
    currentInput.pop();
    boxesEL[attempts.length * 5 + currentInput.length].innerHTML = '';

    toggleButtons();
  }
}

function submitWord() {
  if (stage !== 'going' || currentInput.length < 5) {
    alert('Should be 5 letters');
    return;
  }

  let currentInputStr = currentInput.join('');
  if (!isValidWord(currentInputStr)) {
    alert(`Can't find a word "${currentInputStr}" :(`);
    return;
  }

  let attempt = compareWords();
  let revealed = addAttempt(attempt);
  saveState();

  if (revealed) {
    toWin();
    localStorage.clear();
  } else if (attempts.length === 6) {
    toFail();
    localStorage.clear();
  }
  toggleButtons();
}

function saveState() {
  save('stage', stage);
  save('secretWord', secretWord);
  save('attempts', attempts);
}

function toWin() {
  stage = 'win';
  secretEL.style.display = 'block';
  secretEL.innerHTML = 'Congratulations!';
}

function toFail() {
  stage = 'fail';
  secretEL.style.display = 'block';
  secretEL.innerHTML = `Oops:( The word was ${secretWord.toUpperCase()}`;
}

function startNewGame() {
  secretWord = getRandomWord();
  stage = 'going';
  attempts = [];
  currentInput = [];
  restartEL.blur();

  secretEL.style.display = '';
  boxesEL.forEach(el => {
    el.innerHTML = '';
    el.dataset.color = null;
  });
  keyboardEL.querySelectorAll('button').forEach(el => {
    el.dataset.color = null;
  });

  saveState();
  toggleButtons();
}

function getRandomWord() {
  return window.secretWords[Math.floor(Math.random() * secretWords.length)];
}

function isValidWord(word) {
  if (window.dictionary) {
    return window.dictionary.has(word);
  }
  // fallback if the dictionary (huge) is not loaded for some reason
  return secretWords.includes(word);
}

function compareWords() {
  let res = [];

  let letters = {};
  for (let i = 0; i < 5; i++) {
    if (currentInput[i] === secretWord[i]) {
      res.push({color: 'green', letter: currentInput[i]});
    } else {
      letters[secretWord[i]] = (letters[secretWord[i]] || 0) + 1;
      res.push({color: null, letter: currentInput[i]});
    }
  }

  for (let i = 0; i < 5; i++) {
    if (currentInput[i] !== secretWord[i]) {
      if (letters[currentInput[i]] > 0) {
        letters[currentInput[i]]--;
        res[i].color = 'yellow';
      } else {
        res[i].color = 'grey';
      }
    }
  }

  return res;
}

function addAttempt(attempt) {
  if (stage !== 'going') return;

  let revealed = true;
  for (let i = 0; i < 5; i++) {
    const {color, letter} = attempt[i];
    if (color !== 'green') revealed = false;

    if (color) {
      boxesEL[attempts.length * 5 + i].dataset.color = color;
      paintOverKeyboardKey(letter, color);
    }
  }
  attempts.push(attempt);
  currentInput = [];

  return revealed;
}

function firstRender() {
  toggleButtons();

  let i = 0;
  attempts.forEach(attempt => {
    attempt.forEach(({color, letter}) => {
      boxesEL[i].dataset.color = color;
      boxesEL[i].innerHTML = letter;
      paintOverKeyboardKey(letter, color);
      i++;
    });
  });
}

function toggleButtons() {
  deleteEL.toggleAttribute('disabled', currentInput.length === 0);
  enterEL.toggleAttribute('disabled', currentInput.length < 5);
}

function save(key, value) {
  try {
    return localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    return null;
  }
}

function getSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (err) {
    return null;
  }
}
