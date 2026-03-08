import './style.css';

const goalSentenceElement = document.getElementById('goal-sentence') as HTMLDivElement;
const goalSentence =  "banquet squirrel equivalent"//equally quarry" // tequila qualified quixotic quick relinquishing piqued acquiescence squander obsequiously q ualifies;
const timerElement = document.getElementById('timer') as HTMLDivElement;
// const debugElement = document.getElementById('debug') as HTMLDivElement;
const wrongCharsCountElement = document.getElementById('wrong-chars-count') as HTMLDivElement;

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

    const isCorrectCharacter = typedChar === goalSentence[currentIndex];
    if (isCorrectCharacter) {
      span.style.color = 'green';
      const isFinished = typedSentence.length === goalSentence.length && wrongCharactersCount === 0;
      if (isFinished){
        timerIsOn = false;
        resetRun(timerIntervalId);
       
        return;
      } else if (typedSentence.length === goalSentence.length && wrongCharactersCount > 0){
        return;
      }
    } else {
      span.style.color = 'red';
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
  } else if (isRestart) { // Tab
    event.preventDefault();
    resetRun(timerIntervalId);
    typedSentence = "";
    Array.from(goalSentenceElement.children).forEach(span => {
      (span as HTMLSpanElement).style.color = 'black';
    });
  } else {
    console.log(`Ignored key: ${event.key}`);
  } 
})