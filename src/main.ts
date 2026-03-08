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

function resetRun(timerIntervalId: number){
  // clear timer
  clearInterval(timerIntervalId);
  timerIsOn = false;
  timerElement.textContent = timeElapsed.toString();
  timeElapsed = 0;
  // clear sentence
  typedSentence = "";
  wrongCharactersCount = 0;
  wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;

  Array.from(goalSentenceElement.children).forEach(span => {
    (span as HTMLSpanElement).style.color = 'black';
    (span as HTMLSpanElement).style.backgroundColor = 'transparent';
  });
}
window.addEventListener('keydown', (event) => {
  console.log(`Key: ${event.key}, Code: ${event.code}`);
  const isPermittedAlphabet = /^[\s\w\W]$/.test(event.key);
  const isRestart = event.key === 'Tab';
  const canErase = event.key === 'Backspace' && typedSentence.length > 0;
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
    span.style.backgroundColor = "#dce1e5";

    const isCorrectCharacter = typedChar === goalSentence[currentIndex] && wrongCharactersCount === 0;
    if (isCorrectCharacter) {
      span.style.color = 'green';
      const isFinished = typedSentence.length === goalSentence.length && wrongCharactersCount === 0;
      if (isFinished){
        timerIsOn = false;
        const wordUnit = goalSentence.length / 5;
        const wordsPerSecond = wordUnit/timeElapsed; // handle timeElapsed === 0
        const wordsPerMinute = Math.floor(wordsPerSecond * 60);
        wpmElement.textContent = `${wordsPerMinute} wpm`;
        resetRun(timerIntervalId);
        return;
      } else if (typedSentence.length === goalSentence.length && wrongCharactersCount > 0){
        return;
      }
    } else {
      span.style.color = 'red';
      span.style.backgroundColor = '#fbaaaa';
      wrongCharactersCount++;
      wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;
    }
  } else if (canErase) { // Backspace
    const span = goalSentenceElement.children[typedSentence.length - 1] as HTMLSpanElement;
    typedSentence = typedSentence.slice(0, -1);
    if (span.style.color === "red"){
      wrongCharactersCount--;
      wrongCharsCountElement.textContent = `Wrong Chars: ${wrongCharactersCount}`;
    }
    span.style.color = 'black';
    span.style.backgroundColor = 'transparent';
  } else if (isRestart) { // Tab
    event.preventDefault();
    resetRun(timerIntervalId);
  } else {
    console.log(`Ignored key: ${event.key}`);
  } 
})