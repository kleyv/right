import './style.css';

const goalSentenceElement = document.getElementById('goal-sentence') as HTMLDivElement;
const goalSentence =  "banquet squirrel equivalent"//equally quarry" // tequila qualified quixotic quick relinquishing piqued acquiescence squander obsequiously q ualifies;

goalSentence.split('').map(char => {
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace';
  span.textContent = char;
  goalSentenceElement.appendChild(span);
  return span;
})

let typedSentence = "";

window.addEventListener('keydown', (event) => {
  console.log(`Key: ${event.key}, Code: ${event.code}`);
  const isPermittedAlphabet = /^[\s\w\W]$/.test(event.key);
  const isRestart = event.key === 'Tab';
  const canErase = event.key === 'Backspace' && typedSentence.length > 0;
  if (isPermittedAlphabet) {
    typedSentence += event.key;
    const currentIndex = typedSentence.length - 1;
    const typedChar = typedSentence[currentIndex];
    const span = goalSentenceElement.children[currentIndex] as HTMLSpanElement;

    const isCorrectCharacter = typedChar === goalSentence[currentIndex];
    if (isCorrectCharacter) {
      span.style.color = 'green';
    } else {
      span.style.color = 'red';
    }
  } else if (canErase) { // Backspace
    const span = goalSentenceElement.children[typedSentence.length - 1] as HTMLSpanElement;
    typedSentence = typedSentence.slice(0, -1);
    span.style.color = 'black';
  } else if (isRestart) { // Tab
    event.preventDefault();
    typedSentence = "";
    Array.from(goalSentenceElement.children).forEach(span => {
      (span as HTMLSpanElement).style.color = 'black';
    });
  } else {
    console.log(`Ignored key: ${event.key}`);
  } 
})