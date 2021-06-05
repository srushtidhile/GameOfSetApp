/* eslint-disable no-alert */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-template */
/* eslint-disable no-undef */

/*
* Variables for the different card decks/sets to manage
*/
let deck = []; // holds all cards not currently displayed or turned into a set
let cardsDisplayed = []; // holds cards currently displayed
let input = []; // cards the user has chosen
let cardsDisplayedButtons = []; // button html objects for all the displayed cards
let hints = []; // stores the hint cards for the current cards displayed

/*
* Card attributes setup
*/
// arrays to iterate through to generate the card deck
const shapes = ['parallelogram', 'circle', 'square'];
const shades = ['shaded', 'solid', 'open'];
const colors = ['green', 'red', 'purple'];

// generic card object to be populated by each card
let card = {
  shape: String,
  shade: String,
  color: String,
  number: Number,
};

/*
* Page structure setup
*/
//gets main page to add content to
const page = document.getElementById('general-container'); 
//creates a page that contains a 1x2 grid used when playing the game
const gridPage = document.createElement('div');
gridPage.setAttribute('id', 'grid-container');

//page used for left side of the grid when playing the game
const leftPage = document.createElement('div');
leftPage.setAttribute('id', 'left-container');

//page used for right side of grid when playing the game
//this page also contains a 2x1 grid
const rightPage = document.createElement('div');
rightPage.setAttribute('id', 'right-container');

//page used for top part of right side of the page when playing the game
const rightTopPage = document.createElement('div');
rightTopPage.setAttribute('id', 'right-top-container');

//page used for bottom part of right side of the page when playing the game
const rightBottomPage = document.createElement('div');
rightBottomPage.setAttribute('id', 'right-bottom-container');

/*
* Buttons setup
*/
// create a high scores button to view past scores
const highscoreButton = document.createElement('button');
highscoreButton.setAttribute('class', 'button highscore-button');
highscoreButton.innerHTML = 'HIGH SCORES';

// create a Back to Home button to return to the main page
const returnHomeButton = document.createElement('button');
returnHomeButton.setAttribute('class', 'button'); // To-DO make sure the formatting isn't as weird (i.e. get rid of the tab/indent for the button)
returnHomeButton.innerHTML = '<-- Return';

// create start button to start the game
const startButton = document.createElement('button');
startButton.setAttribute('class', 'button start-button');
startButton.innerHTML = 'START';

// create hint button to generate hints
const hintButton = document.createElement('button');
hintButton.setAttribute('class', 'button hint-button');
hintButton.innerHTML = 'HINT';
hintButton.clicks = 0;

// create quit button to quit the game
const quitButton = document.createElement('button');
quitButton.setAttribute('class', 'button quit-button');
quitButton.innerHTML = 'QUIT';

// create a rules button
const rulesButton = document.createElement('button');
rulesButton.setAttribute('class', 'button rules-button');
rulesButton.innerHTML = 'RULES';

/*
* Scoreboard setup
*/
// create variables to keep track of scores
const highscores = []; // array to hold the high scores from one session of games
let score = []; // holds current score, number of correct sets identified by user, and elapsed time
// create the scoreboard container
const scoreContainer = document.createElement('div');
scoreContainer.setAttribute('class', 'scoreboard');
// enter text inside the score board
const scoreHeader = document.createElement('h1');
scoreContainer.appendChild(scoreHeader);
let scoreMsg = document.createTextNode('Score: ' + score);
scoreHeader.appendChild(scoreMsg);
const hsHeader = document.createElement('h1');
let highestscore = null;
highestscore = document.createTextNode('High Score: 0');
hsHeader.appendChild(highestscore);
scoreContainer.appendChild(hsHeader);

/*
* Time variables for recording time / managing countdown clock
*/
let timeStart;
let timeEnd;
let timeInput;

setupHomePage(); // displays the home page

/*
 * complete the deck by putting all possible combination of card attributes into the deck array
 */
function generateCardDeck() {
  shapes.forEach((shapeElt) => {
    shades.forEach((shadeElt) => {
      colors.forEach((colorElt) => {
        for (let i = 0; i < 3; i += 1) {
          card.shape = shapeElt;
          card.shade = shadeElt;
          card.color = colorElt;
          card.number = i + 1;

          deck.push(card); // add each card to the deck

          card = {};
        }
      });
    });
  });
}

/**
 * return a card thats a clickable element on the screen
 * @param {*} newcard the card to create a button for
 * @param {*} clickable whether that button should be clickable
 */
function generateCardButton(newcard, clickable) {
  const cardButton = document.createElement('button'); // create the button element
  cardButton.setAttribute('class', 'card');
  // give it an onclick if it's clickable
  if (clickable === true) {
    cardButton.onclick = () => {
      addCardToInput(newcard, cardButton);
    };
  } else {
    cardButton.onclick = null;
  }
  // create the shapes on the card
  for (let i = 0; i < newcard.number; i += 1) {
    const shape = document.createElement('div');
    shape.setAttribute('class', newcard.shape + ' ' + newcard.shade + ' ' + newcard.color);
    cardButton.appendChild(shape);
  }

  return cardButton;
}

/**
 * Displays the cards to the screen and ends game if there are no more sets.
 * Displays score and time taken if the game is finished.
 */
function displayCards() {
  // eslint-disable-next-line max-len
  for (let i = cardsDisplayed.length / 3; (i < 4 || !containsSet(cardsDisplayed)) && deck.length > 0; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const index = Math.floor(Math.random() * deck.length);
      cardsDisplayed.push(deck.splice(index, 1)[0]);

      // generate card button for most recent card
      // eslint-disable-next-line no-use-before-define
      const cardButton = generateCardButton(cardsDisplayed[cardsDisplayed.length - 1], true);
      document.getElementById('card-container').appendChild(cardButton);
      cardsDisplayedButtons.push(cardButton);
    }
  }

  // end game
  if (!containsSet(cardsDisplayed)) {
    const d2 = new Date();
    timeEnd = d2.getTime();

    const timeTotal = timeEnd - timeStart;
    score[2] = (timeTotal / 60000).toFixed(2).toString();
    window.alert('The total time spent on the game was ' + (timeTotal / 60000).toFixed(0) + ' minute(s) and ' + (((timeTotal % 60000) / 60000) * 60).toFixed(0) + ' seconds!\nYour score was ' + score[0]);

    finishPlaying();
  }
}

/**
 * This function takes in three card objects and returns true if they form a set, false otherwise
 * @param {*} cardOne the first card object
 * @param {*} cardTwo the second card object
 * @param {*} cardThree the third card object
 */
function isSet(cardOne, cardTwo, cardThree) {
  let isASet = false;
  if (allEqualOrAllDifferent(cardOne.shape, cardTwo.shape, cardThree.shape)
      && allEqualOrAllDifferent(cardOne.shade, cardTwo.shade, cardThree.shade)
      && allEqualOrAllDifferent(cardOne.color, cardTwo.color, cardThree.color)
      && allEqualOrAllDifferent(cardOne.number, cardTwo.number, cardThree.number)) {
    isASet = true;
  }
  return isASet;
}

/**
 * This function checks if the given array of cards contains a set.
 * Returns true if it does, false otherwise
 * @param {*} cards an array of cards
 */
function containsSet(cards) {
  let foundSet = false;
  // check every combination of three cards in the given deck to see if it is a set
  for (let indexOne = 0; indexOne < cards.length - 2; indexOne += 1) {
    for (let indexTwo = indexOne + 1; indexTwo < cards.length - 1; indexTwo += 1) {
      for (let indexThree = indexTwo + 1; indexThree < cards.length; indexThree += 1) {
        if (isSet(cards[indexOne], cards[indexTwo], cards[indexThree])) {
          foundSet = true;
          if (hints.length === 0) {
            hints.push(cards[indexOne]);
            hints.push(cards[indexTwo]);
            hints.push(cards[indexThree]);
          }
        }
      }
    }
  }

  return foundSet;
}

// checks if the elements are all the same or all unique
function allEqualOrAllDifferent(eltOne, eltTwo, eltThree) {
  // eslint-disable-next-line max-len
  return ((eltOne === eltTwo && eltTwo === eltThree) || (eltOne !== eltTwo && eltTwo !== eltThree && eltOne !== eltThree));
}

/**
 * remove cards user has selected from screen and cardsDsiplayed array
 */
function removeInputCards() {
  input.forEach((elt) => {
    const displayIndex = cardsDisplayed.indexOf(elt);
    cardsDisplayed.splice(displayIndex, 1);
    document.getElementById('card-container').removeChild(cardsDisplayedButtons[displayIndex]);
    cardsDisplayedButtons.splice(displayIndex, 1); // remove same button from buttons array
  });

  input = [];
}

/**
 * Adds the given card to the input array and updates the screen accordingly
 * @param {*} newcard the card to add to the input array
 * @param {*} button html button version of the card to add
 */
function addCardToInput(newcard, button) {
  clearMessage(); // clears the last message from the screen
  // if it's already selected, unselect it
  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    const inputIndex = input.indexOf(newcard);
    input.splice(inputIndex, 1);
  // don't let the user select more than 3 cards
  } else if (input.length === 3) {
    createMessage('Cannot select more the 3 elements', 'error');
  } else {
    button.classList.add('selected'); // select the button
    input.push(newcard); // add the card to the input
    // if that was the third selection, check if set or not
    if (input.length === 3) {
      if (containsSet(input)) {
        const d1 = new Date();
        const timeNow = d1.getTime();
        const timePassed = timeNow - timeStart;
        const timeRemaining = timeInput - timeNow;
        score[0] += Math.round((((score[0] + 1) / 81.0) / timePassed) * 1000000);
        score[1] += 1;
        score[2] = (timePassed / 60000).toFixed(2).toString();
        if (timeRemaining >= 0) {
          createMessage('That was a set! Remaining time from the countdown is ' + ((timeRemaining / 60000) - 1).toFixed(0) + ' minutes and ' + (((timeRemaining % 60000) / 60000) * 60).toFixed(0) + ' seconds.', 'success');
        } else {
          createMessage('That was a set! You have finished the countdown time, but keep playing!', 'success');
        }
        updateScoreBoard();
        removeInputCards();
        resetHints();
        displayCards();
      } else {
        createMessage('That was not a set', 'error');
      }
    }
  }
}

/**
 * This function creates a paragraph element on the page with the given text and class
 * @param {*} text message to be displayed
 * @param {*} msgClass class to give to the message
 */
function createMessage(text, msgClass) {
  clearMessage(); // clear the current message
  const msgContainer = document.createElement('div');
  msgContainer.setAttribute('id', 'msg-container');
  // create the paragraph element
  const msg = document.createElement('p');
  msg.setAttribute('id', 'message');
  const textNode = document.createTextNode(text);
  msg.appendChild(textNode);
  msgContainer.setAttribute('class', msgClass);
  msgContainer.appendChild(msg);
  rightBottomPage.append(msgContainer);
}

/**
 * clears a message at the bottom of the screen if it exists
 */
function clearMessage() {
  if (document.getElementById('message') != null) {
    rightBottomPage.removeChild(document.getElementById('msg-container'));
  }
}

/*
 * clear displayed hints
 */
function resetHints() {
  // clear all cards in card container
  if (hintButton.clicks > 0) {
    rightTopPage.removeChild(document.getElementById('card-hint-container'));
    hintButton.clicks = 0;
  }
  hints = [];
}

/**
 * updates the scoreboard with current score and highscore
 */
function updateScoreBoard() {
  // update current score
  scoreHeader.removeChild(scoreMsg);
  // eslint-disable-next-line prefer-template
  scoreMsg = document.createTextNode('Score: ' + score[0]);
  scoreHeader.appendChild(scoreMsg);
  // update highscore
  hsHeader.removeChild(highestscore);
  if (highscores.length > 0) {
    highestscore = document.createTextNode('High Score: ' + highscores[0][0]);
  } else {
    highestscore = document.createTextNode('High Score: 0');
  }
  hsHeader.appendChild(highestscore);
}

/**
 * resets all necessary variables, adds current score to highscores, and returns to home screen
 */
function finishPlaying() {
  highscores.push(score);
  highscores.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));

  // reset decks
  deck = [];
  cardsDisplayed = [];
  input = [];
  cardsDisplayedButtons = [];

  resetHints();

  score = [0,0,0];
  updateScoreBoard();

  setupHomePage();
}

/**
 * onclick method for the start button. Displays the playing page and generates the deck
 */
startButton.onclick = () => {
  setupPlayingPage();

  timeInput = window.prompt('Enter a countdown time in minutes: ', 5);
  timeInput = timeInput * 60000 + new Date().getTime();

  generateCardDeck();
  displayCards();

  const d1 = new Date();
  timeStart = d1.getTime();
  score = [0,0,0];
};

/**
 * onclick function for highscores button. This function will clear the page
 * and display the highscores in an ordered list.
*/
highscoreButton.onclick = () => {
  setupHighScorePage();
};

// set onclick for the return button to finishPlaying function
returnHomeButton.onclick = () => {
  setupHomePage();
};

/**
 * onlclick function for quit button, which simply ends the game
 */
quitButton.onclick = () => {
  finishPlaying();
};

/**
 * onclick function for hint button, which adds a hint to the page if < 3 are present
 */
hintButton.onclick = () => {
  // create card hint container if it doesn't exist
  if (hintButton.clicks === 0) {
    const cardHintContainer = document.createElement('div');
    cardHintContainer.setAttribute('id', 'card-hint-container');
    rightTopPage.appendChild(cardHintContainer);
  }

  // add hint if there are less than 3
  if (hintButton.clicks < 3) {
    document.getElementById('card-hint-container').appendChild(generateCardButton(hints[hintButton.clicks], false));
    hintButton.clicks += 1;
  }
};

/**
 * onclick method for rules button, which displays the rules
 */
rulesButton.onclick = () => {
  // clear the page
  clearPage(page);

  // create header for the rules
  const rulesHeader = document.createElement('h2');
  const rulesTitle = document.createTextNode('Rules:');
  rulesHeader.append(rulesTitle);
  page.appendChild(rulesHeader);

  // print the rules
  const rulesContainer = document.createElement('div'); // box for the text
  rulesContainer.setAttribute('id', 'rules-container');
  const rulesList1 = document.createElement('p'); // start of the text
  const rulesPoint1 = document.createTextNode('There are 81 cards. \n12 cards are dealt at a time.\n');
  const rulesPoint2 = document.createTextNode('As the player finds a set of cards, that set is removed, and three cards from the deck are dealt to make a grid of 12 again.\n');
  const rulesPoint3 = document.createTextNode('There are four categories: color, number, shape, and shading. \nA set consists of three cards with either all same of one feature, or all different of a feature.');
  rulesList1.appendChild(rulesPoint1);
  rulesList1.appendChild(rulesPoint2);
  rulesList1.appendChild(rulesPoint3);
  rulesList1.setAttribute('id', 'rules');
  rulesContainer.appendChild(rulesList1);
  page.appendChild(rulesContainer);

  page.appendChild(returnHomeButton);
};

/**
 * clears the given page of all children
 * @param {*} pageToClear the page to clear
 */
function clearPage(pageToClear) {
  while (pageToClear.firstChild) {
    pageToClear.removeChild(pageToClear.firstChild);
  }
}

/**
 * appends buttons that appear on home page after clearing current page
 */
function setupHomePage() {
  clearAllPages();

  page.appendChild(startButton);
  page.appendChild(highscoreButton);
  page.appendChild(rulesButton);
}

/**
 * appends html elements that appear on the playing page after clearing the current page
 */
function setupPlayingPage() {
  clearAllPages();
  appendPages();

  const cardContainer = document.createElement('div');
  cardContainer.setAttribute('id', 'card-container');
  leftPage.appendChild(cardContainer);

  rightTopPage.appendChild(scoreContainer);
  rightTopPage.appendChild(hintButton);
  rightTopPage.appendChild(quitButton);
}

/**
 * appends grid elements to the page
 */
function appendPages() {
  page.appendChild(gridPage);
  gridPage.appendChild(leftPage);
  gridPage.appendChild(rightPage);
  rightPage.appendChild(rightTopPage);
  rightPage.appendChild(rightBottomPage);
}

/**
 * clears all the pages of children
 */
function clearAllPages() {
  clearPage(rightBottomPage);
  clearPage(rightTopPage);
  clearPage(rightPage);
  clearPage(leftPage);
  clearPage(gridPage);
  clearPage(page);
}

/**
 * appends html elements that appear on the highscore page
 */
function setupHighScorePage() {
  // clear the page
  clearPage(page);

  // create header for the highscore list
  const highscoreHeader = document.createElement('h2');
  const highscoreTitle = document.createTextNode('Highscores:');
  highscoreHeader.append(highscoreTitle);
  page.appendChild(highscoreHeader);

  // create table to print top 10 high scores
  let table = document.createElement('table');

  table.setAttribute('class', 'highscore-table');

  addTableHeader(table,"Number");
  addTableHeader(table,"Score");
  addTableHeader(table,"Sets");
  addTableHeader(table,"Time (min)");

  // create each row for table
  for (let i = 0; i < highscores.length && i < 10; i += 1) {

    let tableRow = document.createElement('tr');

    addTableData(tableRow, i+1);
    addTableData(tableRow, highscores[i][0]);
    addTableData(tableRow, highscores[i][1]);
    addTableData(tableRow, highscores[i][2]);

    table.appendChild(tableRow)
  }

  // append the table to the page
  page.appendChild(table);
  // create a Back to Homepage button
  page.appendChild(returnHomeButton);
}


/**
 * appends a table header to the table with text in variable 'text'
 * @param table table element to append table header to
 * @param text text the table header will have
 */
function addTableHeader(table,text)
{
  const header = document.createElement('th');
  const headerTxt = document.createTextNode(text);
  header.appendChild(headerTxt);
  table.appendChild(header);
}


/**
 * appends table data to table row with text in variable 'text'
 * @param tableRow table row to append table data to
 * @param text text the table data will have
 */
function addTableData (tableRow,text) {

  const tableData = document.createElement('td');
  const tableEntry = document.createTextNode(text);

  tableData.appendChild(tableEntry)
  tableRow.appendChild(tableData);

}
