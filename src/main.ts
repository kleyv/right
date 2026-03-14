import './style.css';

const goalSentenceElement = document.getElementById('goal-sentence') as HTMLDivElement;
const goalSentence =  "banquet squirrel equivalent equally quarry tequila qualified quixotic quick relinquishing piqued acquiescence squander obsequiously qualifies" //;
const timerElement = document.getElementById('timer') as HTMLDivElement;
const wrongCharsCountElement = document.getElementById('wrong-chars-count') as HTMLDivElement;
const wpmElement = document.getElementById('wpm') as HTMLDivElement;
const mistakeModeElement = document.getElementById('mistake-mode') as HTMLSelectElement;



type MistakeMode = "continue" | "restartWord" | "stop"; //"restartRun" 
type CharState = "pending" | "wrong" | "correct";
const state = {
  typedSentence: "",
  timerIsOn: false,
  timeElapsed: 0,
  lastCorrectCharacterIndex: -1,
  charStates: [] as CharState[],
  timerIntervalId: 0,
  getWrongCharactersCount(){
    return this.charStates.filter(state => state === "wrong").length;
  },
  mistakeMode: "continue" as MistakeMode,
  isLastCharacterCorrect: true
}

mistakeModeElement.addEventListener('change', () => {
  state.mistakeMode = mistakeModeElement.value as MistakeMode;
});

goalSentence.split('').map(char => {
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace'; // already specified on the css
  span.textContent = char;
  goalSentenceElement.appendChild(span);
  return span;
})


function resetRun(){
  clearInterval(state.timerIntervalId);
  state.timerIsOn = false;
  state.timeElapsed = 0;
  renderTimer();
  state.typedSentence = "";
  state.lastCorrectCharacterIndex = -1;
  state.charStates = new Array(goalSentence.length).fill("pending");
  renderWrongCount()
  
  state.charStates.forEach((_, index) => {
    renderCharacter(index);
  });
}

function eraseLastCharacter() {
  if (state.typedSentence.length === 0) return;

  const lastIndex = state.typedSentence.length - 1;
  state.typedSentence = state.typedSentence.slice(0, -1);

  if(state.charStates[lastIndex] === "correct"){
    state.lastCorrectCharacterIndex--;
  }

  state.charStates[lastIndex] = "pending";
  renderWrongCount(); // could render only when lastIndex was wrong
  renderCharacter(lastIndex);
}
function renderTimer(){
  timerElement.textContent = state.timeElapsed.toString();
}
function renderWrongCount(){
  wrongCharsCountElement.textContent = `Wrong Chars: ${state.getWrongCharactersCount()}`;
}
function renderCharacter(index: number){
  console.log(state.charStates.length);
  console.log(index === state.typedSentence.length -1);
  const span = goalSentenceElement.children[index] as HTMLSpanElement;
  const status = state.charStates[index] ?? "pending";
  if (status === "correct"){
    span.style.color = "green";
    span.style.backgroundColor = "#dce1e5";
  } else if (status === "wrong"){
    span.style.color = "red";
    span.style.backgroundColor = '#fbaaaa';
  } else {
    span.style.color = "black";
    span.style.backgroundColor = "transparent";

  }
  
  if (state.isLastCharacterCorrect) {
    document.querySelector("body")!.style.backgroundColor = "transparent";
  } else {
    document.querySelector("body")!.style.backgroundColor = "#ffecec";
  }
}

window.addEventListener('keydown', (event) => {
  const { ctrlKey } = event;

  const isEraseChunk = ctrlKey && event.key === 'Backspace';
  if (isEraseChunk) { // works but smells funny
    event.preventDefault();
    if (state.typedSentence.length === 0) return;

    if (state.lastCorrectCharacterIndex < state.typedSentence.length - 1){
      while (
        state.typedSentence.length > 0 &&
        state.lastCorrectCharacterIndex < state.typedSentence.length - 1
      ){
        eraseLastCharacter();
      }
      return;
    }
    let trailingSpaces = 0;
    while (
      trailingSpaces < state.typedSentence.length &&
      state.typedSentence[state.typedSentence.length - 1 - trailingSpaces] === ' '
    ) {
      trailingSpaces++;
    }
    if (trailingSpaces > 1) {
      for (let i = 0; i < trailingSpaces - 1; i++) {
        eraseLastCharacter();
      }
      return; // first Ctrl+Backspace: "   " -> " "
    }

    if (state.typedSentence.length > 0 &&
        state.typedSentence[state.typedSentence.length - 1] === ' ') {
      eraseLastCharacter(); // remove the single trailing space
    }
    while (
      state.typedSentence.length > 0 &&
      state.typedSentence[state.typedSentence.length - 1] !== ' '
    ) {
      eraseLastCharacter(); // remove word chars until previous space/start
    }
    return;
  }

  const isPermittedAlphabet = /^[\s\w\W]$/.test(event.key);
  if (isPermittedAlphabet) {
    if (!state.timerIsOn) {
      state.timerIsOn = true;
      state.timerIntervalId = setInterval(() => {
        state.timeElapsed++;
        renderTimer();
      }, 1000)
    }

    state.typedSentence += event.key;
    const currentIndex = state.typedSentence.length - 1;
    const typedChar = state.typedSentence[currentIndex];
    
    const isCorrectCharacter = typedChar === goalSentence[currentIndex] && state.getWrongCharactersCount() === 0;
    if (isCorrectCharacter) {
      state.isLastCharacterCorrect = true;
      state.charStates[currentIndex] = "correct";
      state.lastCorrectCharacterIndex++;
      
      const isFinished = state.typedSentence.length === goalSentence.length && state.getWrongCharactersCount() === 0;
      if (isFinished) {
        state.timerIsOn = false;
        const wordUnit = goalSentence.length / 5;
        const wordsPerSecond = wordUnit/state.timeElapsed; // handle timeElapsed === 0
        const wordsPerMinute = Math.floor(wordsPerSecond * 60);
        wpmElement.textContent = `${wordsPerMinute} wpm`;
        resetRun();
        return;
      }
      
      const isAtEndWithErrors = state.typedSentence.length === goalSentence.length && state.getWrongCharactersCount() > 0; 
      if (isAtEndWithErrors) {
        return;
      }
      
      renderCharacter(state.typedSentence.length - 1);
      return;
    }

    state.isLastCharacterCorrect = false;
    state.charStates[currentIndex] = "wrong";
    renderCharacter(state.typedSentence.length - 1);
    renderWrongCount();
    switch (state.mistakeMode) {
      case "stop":
        eraseLastCharacter();
        break;
      case "restartWord":
        eraseLastCharacter();
        while (
          state.typedSentence.length > 0 &&
          state.typedSentence[state.typedSentence.length - 1] !== ' '
        ) {
          eraseLastCharacter(); // remove word chars until previous space/start
        }
        break;
      case "continue":
        break;
      default:
        break;
    }
    return;
  }
  
  const canErase = event.key === 'Backspace' && state.typedSentence.length > 0;
  if (canErase) { // Backspace
    eraseLastCharacter();
    return;
  }
  
  const isRestart = event.key === 'Tab';
  if (isRestart) { // Tab
    event.preventDefault();
    resetRun();
    return;
  }

  console.log(`Ignored key: ${event.key}`);
})
