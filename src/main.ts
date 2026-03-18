import './style.css';

const goalSentenceElement = document.getElementById('goal-sentence') as HTMLDivElement;
const timerElement = document.getElementById('timer') as HTMLDivElement;
const wrongCharsCountElement = document.getElementById('wrong-chars-count') as HTMLDivElement;
const wpmElement = document.getElementById('wpm') as HTMLDivElement;
const mistakeModeElement = document.getElementById('mistake-mode') as HTMLSelectElement;
const historyElement = document.getElementById('history') as HTMLDetailsElement;

const response = await fetch('/src/en_1k.txt');
const text = await response.text();
const words = text
  .split('\n')
  
const WORD_COUNT = 50;
let goalSentence = words.sort(() => Math.random() - 0.5).slice(0, WORD_COUNT).join(" ");

function renderGoalSentence() {
  goalSentenceElement.innerHTML = "";
  goalSentence.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    goalSentenceElement.appendChild(span);
  });
}
renderGoalSentence();

type RunSample = readonly [key: string, delayMs: number];
type Run = RunSample[];
type Entry = {
  timestamp: number,
  run: Run,
  goalSentenceLength: number,
}

let entriesData = localStorage.getItem('rightEntries');
let entries: Entry[];
if (!entriesData){
  entries = [];
} else {
  entries = JSON.parse(entriesData);
}


function renderEntries(){
  if(entries.length === 0){
    historyElement.innerHTML = "<p>No entries yet</p>";
  } else {
    const sortedEntries = Array.from(entries).sort((a: Entry, b: Entry) => b.timestamp - a.timestamp).slice(0,10);
    const rows = sortedEntries.map((entry: Entry) => {
      const p = document.createElement('p');
      // const totalTime = entry.run.reduce((acc, agg) => acc + agg[1],0);
      // const wpm = Math.round((entry.run.length / (totalTime/1000)) * 60) / 5;
      const wpm  = computeGoalWpm(entry);
      const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      });
      p.innerText = `${formattedDate}\t|\t${wpm}`;
      return p;
    });
    historyElement.innerHTML = rows.map(row => row.outerHTML).join('\n');
  }
}

renderEntries();
let run: Run = [];
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
  mistakeMode: "restartWord" as MistakeMode,
  isLastCharacterCorrect: true
}

mistakeModeElement.value = state.mistakeMode;
mistakeModeElement.addEventListener('change', () => {
  state.mistakeMode = mistakeModeElement.value as MistakeMode;
  // update seleteted value in the select element
  mistakeModeElement.value = state.mistakeMode;
});

function resetRun(){
  clearInterval(state.timerIntervalId);
  run = [];
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

let keyStartTime: Date;
function getKeyTimerTime(){
  return Date.now() - keyStartTime!.getTime();
}

function computeGoalWpm(entry: Entry): number {
  const totalTimeMs = entry.run.reduce((acc, [, delayMs]) => acc + delayMs, 0);
  if (totalTimeMs <= 0) return 0;
  const words = entry.goalSentenceLength / 5;
  
  const totalMinutes = totalTimeMs / 1000 / 60;
  if (totalMinutes <= 0) return 0;
  
  return Math.round(words / totalMinutes);
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
      const runStartTime = Date.now()
      keyStartTime = new Date();
      state.timerIntervalId = setInterval(() => {
        state.timeElapsed = Math.floor((Date.now() - runStartTime)/1000);
        renderTimer();
      }, 1000)
    }

    let delay = getKeyTimerTime();
    keyStartTime = new Date();
    run.push([event.key, delay]);
    console.log(run);
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
        const goalSentenceLength = goalSentence.length;
        state.timerIsOn = false;
        // const totalTime = run.reduce((acc, [_, delay]) => acc + delay, 0);
        const entry = {timestamp: Date.now(), run, goalSentenceLength};
        entries.push(entry);
        localStorage.setItem('rightEntries',JSON.stringify(entries));
        renderEntries();
        
        // const totalWords =  goalSentence.length / 5;
        // const minutesTaken = totalTime / 1000 / 60;
        // const wpm = totalWords / minutesTaken
        // const wpm = Math.round((goalSentence.length / (totalTime/1000)) * 60) / 5;
        const wpm = computeGoalWpm(entry);
        wpmElement.textContent = `${wpm} wpm`;
        resetRun();
        goalSentence = words.sort(() => Math.random() - 0.5).slice(0, WORD_COUNT).join(" ");
        renderGoalSentence();
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
