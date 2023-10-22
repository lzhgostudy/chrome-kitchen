


// Declare add image function to save downloaded images
function addImage(url) {
  chrome.storage.local.get("savedImages", (result) => {
    // Check if storage has exsisting arrays
    // If array found, blank array is replaced with found array
    // If no array, we add to created blank array
    const downloadArray = result.savedImages ?? [];
    // Images are added
    downloadArray.push(url);
    // Chrome stores the new array with the new image
    chrome.storage.local.set({ savedImages: downloadArray }, function() {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log('Image saved successfully');
      }
    });
  });
}

// Grabs the imageDiv from the popup
const imageDiv = document.getElementById('image_div');

function setUp(array) {
  chrome.storage.local.get(['saveImages', 'thumbnails'], (config) => {
    for (let src of array) {
      const newImage = document.createElement('img');
      const lineBreak = document.createElement('br');

      newImage.src = src;
      console.log(newImage);
      // Add an onclick event listener
      newImage.addEventListener('click', () => {
        // Downloads and image when it is clicked on
        chrome.downloads.download({ url: newImage.src });
        // Checks if extension is set to store images
        if (config.saveImages) {
          addImage(newImage.src);
        }
      });

      // Checks extension thumbnail settings
      if (config.thumbnails) {
        // If on, popup displays images as thumnails
        const newDiv = document.createElement('div');
        newDiv.className = "square";
        newDiv.appendChild(newImage);
        imageDiv.appendChild(newDiv);
      } else {
        // If off, popup displays images as full size
        imageDiv.appendChild(newImage);
      }

      imageDiv.appendChild(lineBreak);
    }
  })
}

async function getCurrentTabId() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

// Runs script when popup is opened]
chrome.scripting.executeScript({
  target: { tabId: await getCurrentTabId() },
  func: () => {
    // Script code to inject on page
    // Selects images then returns array of their currentSrc
    const images = document.querySelectorAll("img");
    const srcArray = Array.form(images).map((img) => img.currentSrc);
    setUp(srcArray);
  }
});

// chrome.scripting.executeScript({ code: scriptCode }, (result) => {
//   setUp(result[0])
// });

const optionsButton = document.getElementById('options_button');

optionsButton.addEventListener('click', () => {
  chrome.tabs.create({ url: "options.html"});
})