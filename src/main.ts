import './style.css';

const goalSentenceElement = document.getElementById('goal-sentence') as HTMLDivElement;
const goalSentence =  "banquet squirrel equivalent equally quarry tequila qualified quixotic quick relinquishing piqued acquiescence squander obsequiously qualifies" //;
const timerElement = document.getElementById('timer') as HTMLDivElement;
const wrongCharsCountElement = document.getElementById('wrong-chars-count') as HTMLDivElement;
const wpmElement = document.getElementById('wpm') as HTMLDivElement;

goalSentence.split('').map(char => {
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace';
  span.textContent = char;
  goalSentenceElement.appendChild(span);
  return span;
})

let typedSentence = "";
let wrongCharactersCount = 0;
let timerIsOn = false;
let timeElapsed = 0;
let timerIntervalId: number;
let lastCorrectCharacterIndex = -1;

function resetRun(timerIntervalId: number){
  // clear timer
  clearInterval(timerIntervalId);
  timerIsOn = false;
  timerElement.textContent = timeElapsed.toString();
  timeElapsed = 0;
  // clear sentence
  typedSentence = "";
  wrongCharactersCount = 0;
  lastCorrectCharacterIndex = -1;
  wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;

  Array.from(goalSentenceElement.children).forEach(span => {
    (span as HTMLSpanElement).style.color = 'black';
    (span as HTMLSpanElement).style.backgroundColor = 'transparent';
  });
}

function eraseLastCharacter() {
  if (typedSentence.length === 0) return;

  const lastIndex = typedSentence.length - 1;
  const span = goalSentenceElement.children[lastIndex] as HTMLSpanElement;
  typedSentence = typedSentence.slice(0, -1);

  if (span.style.color === 'red') {
    wrongCharactersCount--;
    wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;
  }
  
  if(span.style.color === "green"){
    lastCorrectCharacterIndex--;
  }

  span.style.color = 'black';
  span.style.backgroundColor = 'transparent';
}
window.addEventListener('keydown', (event) => {
  // console.log(event);
  // console.log(`Key: ${event.key}, Code: ${event.code}`);
  const { ctrlKey } = event;

  const isEraseChunk = ctrlKey && event.key === 'Backspace';
  if (isEraseChunk) { // works but smells funny
    event.preventDefault();
    if (typedSentence.length === 0) return;

    // delete till last correct character
    if (lastCorrectCharacterIndex < typedSentence.length - 1){
      while (
        typedSentence.length > 0 &&
        lastCorrectCharacterIndex < typedSentence.length - 1
      ){
        eraseLastCharacter();
      }
      return;
    }
    // If we have multiple trailing spaces, shrink them to a single space
    let trailingSpaces = 0;
    while (
      trailingSpaces < typedSentence.length &&
      typedSentence[typedSentence.length - 1 - trailingSpaces] === ' '
    ) {
      trailingSpaces++;
    }
    if (trailingSpaces > 1) {
      for (let i = 0; i < trailingSpaces - 1; i++) {
        eraseLastCharacter();
      }
      return; // first Ctrl+Backspace: "   " -> " "
    }

    // Otherwise, delete the previous word (keeping one space before it)
    if (typedSentence.length > 0 &&
        typedSentence[typedSentence.length - 1] === ' ') {
      eraseLastCharacter(); // remove the single trailing space
    }
    while (
      typedSentence.length > 0 &&
      typedSentence[typedSentence.length - 1] !== ' '
    ) {
      eraseLastCharacter(); // remove word chars until previous space/start
    }
    return;
  }

  const isPermittedAlphabet = /^[\s\w\W]$/.test(event.key);
  if (isPermittedAlphabet) {
    if (!timerIsOn) {
      timerElement.textContent = "0";
      timerIsOn = true;
      timerIntervalId = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = timeElapsed.toString();
      }, 1000)
    }

    typedSentence += event.key;
    
    const currentIndex = typedSentence.length - 1;
    const typedChar = typedSentence[currentIndex];
    const span = goalSentenceElement.children[currentIndex] as HTMLSpanElement;
    console.log({typedSentence, currentIndex, typedChar});

    const isCorrectCharacter = typedChar === goalSentence[currentIndex] && wrongCharactersCount === 0;
    if (isCorrectCharacter) {
      lastCorrectCharacterIndex++;
      span.style.color = 'green';
      span.style.backgroundColor = "#dce1e5";

      const isFinished = typedSentence.length === goalSentence.length && wrongCharactersCount === 0;
      if (isFinished) {
        timerIsOn = false;
        const wordUnit = goalSentence.length / 5;
        const wordsPerSecond = wordUnit/timeElapsed; // handle timeElapsed === 0
        const wordsPerMinute = Math.floor(wordsPerSecond * 60);
        wpmElement.textContent = `${wordsPerMinute} wpm`;
        resetRun(timerIntervalId);
        return;
      }

      const isAtEndWithErrors = typedSentence.length === goalSentence.length && wrongCharactersCount > 0; 
      if (isAtEndWithErrors) {
        return;
      }

      // If not finished, just return (color has already been set)
      return;
    }

    // If incorrect character
    span.style.color = 'red';
    span.style.backgroundColor = '#fbaaaa';
    wrongCharactersCount++;
    wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;
    return;
  }
  
  const canErase = event.key === 'Backspace' && typedSentence.length > 0;
  if (canErase) { // Backspace
    eraseLastCharacter();
    return;
  }
  
  const isRestart = event.key === 'Tab';
  if (isRestart) { // Tab
    event.preventDefault();
    resetRun(timerIntervalId);
    return;
  }

  console.log(`Ignored key: ${event.key}`);
})
