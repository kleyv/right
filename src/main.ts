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