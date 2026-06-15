 // Touch support for ios to use :active class
document.body.addEventListener('touchstart', function() {}, {passive: true});

async function loadWebsiteData() {
  try {
    // 1. Fetch the static JSON file from your GitHub Pages deployment
    const response = await fetch('./content/data.json');
    const data = await response.json(); // Native parsing into a JS Object

    // 2. Destructure the JSON structure we built
    const lastModified = data.metadata?.lastModified;
    const { content } = data;

    console.log('json', 'content:', content, 'lastModified:', lastModified)

  } catch (error) {
    console.error("Could not fetch cached JSON dataset:", error);
  }
}

loadWebsiteData();


fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(htmlString => {
        // Get content from google doc
        const parser = new DOMParser();
        const googleDoc = parser.parseFromString(htmlString, 'text/html');
        
        const docBody = googleDoc.body;

        const elementsWithStyle = docBody.querySelectorAll('[style]');
        elementsWithStyle.forEach(el => el.removeAttribute('style'));

        // Format into individual 'thoughts'
        const thoughts = [];
        const paragraphs = docBody.querySelectorAll('p');
        let publishThought = true;

        paragraphs.forEach(paragraph => {
            const text = paragraph.innerText.trim();
            const isNewThought = text.includes('#');

            // Set line breaks on empty spans
            if (!text) { 
                paragraph.classList.add('lineBreak');
            }

            // Split into array of thoughts by splitting on '#'
            if (isNewThought && !text.toLowerCase().includes('no publish')) {
                // Start a new thought
                publishThought = true;
                thoughts.push([]);
            }

            // Skip 'no publish'
            if (isNewThought && text.toLowerCase().includes('no publish')) {
                publishThought = false;
            }

            if (publishThought && !isNewThought) {
                thoughts[thoughts.length -1].push(paragraph);
            }

            // Set title
            if (text.charAt(text.length -1) === ':') {
                paragraph.classList.add('title');
            }
        });

        // Update the counter
        const counter = document.querySelector('.counter');
        if (counter) {
            counter.innerText = thoughts.length;
        }

        // Create a div for each 'thought'
        const contentContainer = document.getElementById('content');
        contentContainer.innerHTML = ''; // Clear previous content

        const shuffledThoughts = shuffleArray(thoughts);

        thoughts.forEach(thoughtElements => {
            // Create a wrapper div for this specific "thought" card
            const thoughtCard = document.createElement('div');
            thoughtCard.classList.add('thought-card');

            // Append all paragraphs belonging to this thought into the card
            thoughtElements.forEach(p => {
                thoughtCard.appendChild(p.cloneNode(true));
            });

            // Set rotation
            const maxDegrees = 3; 
            const randomAngle = (Math.random() * maxDegrees * 2) - maxDegrees;
            thoughtCard.style.transform = `rotate(${randomAngle}deg)`;

            // Add the finished card to the main container
            contentContainer.appendChild(thoughtCard);
        });
    })
    .catch(error => {
        document.getElementById('content').innerHTML = `<span class="error">Failed to fetch document via Drive API.</span>`;
        console.error('Error:', error);
    });

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
