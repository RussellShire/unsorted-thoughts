 // Touch support for ios to use :active class
document.body.addEventListener('touchstart', function() {}, {passive: true});

updatePage();

const shuffleButton = document.querySelector('#shuffle-button');

console.log('shuffleButton', shuffleButton);

function handleShuffleClicked() {
  console.log('Button was clicked!');
  updatePage();
}

button.addEventListener('click', handleShuffleClicked);

async function updatePage() {
    const data = await loadWebsiteData();
    if (!data) return;

    const { content, metadata } = data;

    // Update the counter
    const counter = document.querySelector('.counter');
    if (counter) {
        counter.innerText = content.length;
    }

    // Create a div for each 'thought'
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = ''; // Clear previous content

    // TODO Update this to make a copy rather than editing in place
    shuffleArray(content);

    content.forEach(thoughtHtmlStrings => {
        // Create a wrapper div for this specific "thought" card
        const thoughtCard = document.createElement('div');
        thoughtCard.classList.add('thought-card');

        // Append all paragraphs belonging to this thought into the card
        thoughtHtmlStrings.forEach(htmlString => {
            thoughtCard.insertAdjacentHTML('beforeend', htmlString);
        });

        // Set rotation
        const maxDegrees = 3; 
        const randomAngle = (Math.random() * maxDegrees * 2) - maxDegrees;
        thoughtCard.style.transform = `rotate(${randomAngle}deg)`;

        // Add the finished card to the main container
        contentContainer.appendChild(thoughtCard);
    });
}

async function loadWebsiteData() {
  try {
    // 1. Fetch the static JSON file from your GitHub Pages deployment
    const response = await fetch('./content/data.json');
    const data = await response.json(); // Native parsing into a JS Object

    return data;
  } catch (error) {
    console.error("Could not fetch cached JSON dataset:", error);
  }
}

function shuffleArray(array) {
    // Loop backwards from the last element down to the second element
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements array[i] and array[j] using destructuring assignment
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
