// Initialize the extension
function initializeExtension() {
  // Create tooltip container
  const tooltipContainer = document.createElement('div');
  tooltipContainer.className = 'credibility-tooltip-container';
  document.body.appendChild(tooltipContainer);

  let selectedText = '';

  function createIconButton() {
    const button = document.createElement('button');
    button.className = 'info-button';
  
    const logo = document.createElement('img');
    // Use chrome.runtime.getURL to get the correct path to your extension resource
    logo.src = chrome.runtime.getURL('icon48.png');
    logo.alt = 'InfoShield Logo';
  
    // Scale the image so it fits nicely in your 40×40 button
    logo.style.width = '24px';
    logo.style.height = '24px';
  
    button.appendChild(logo);
  
    // On click, fetch fact-check data from the backend and update the tooltip
    button.addEventListener('click', showTooltipContent);
  
    return button;
  }
  

  function showTooltipContent(event) {
    event.stopPropagation();
  
    // Position tooltip in center of viewport while loading
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    tooltipContainer.style.left = `${viewportWidth / 2}px`;
    tooltipContainer.style.top = `${viewportHeight / 2}px`;
  
    // Display a loading spinner
    tooltipContainer.innerHTML = `<div class="tooltip-loading"></div>`;
    tooltipContainer.style.display = 'block';
  
    // Replace the URL below with your production backend URL
    fetch("http://127.0.0.1:8000/fact-check", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selectedText })
    })
      .then(response => response.json())
      .then(data => {
        // Process the returned markdown sources into clickable links
        const formattedSources = data.Sources
          .map(src => {
            const match = src.match(/\[(.*?)\]\((.*?)\)/);
            return match ? `<a href="${match[2]}" target="_blank">${match[1]}</a>` : src;
          })
          .join('<br>');
  
        // Determine the color based on the credibility score
        const score = data["Credibility Score"];
        let scoreColor;
        if (score < 50) {
          scoreColor = 'rgb(139, 0, 0)';
        } else if (score < 70) {
          scoreColor = 'rgb(173, 134, 36)';
        } else if (score >= 80) {
          scoreColor = 'rgb(0, 139, 16)';
        } else {
          // For scores between 70 and 80, default to orange
          scoreColor = 'rgb(173, 124, 0)';
        }
  
        // Inject the tooltip content with dynamic color coding and let CSS handle animations
        tooltipContainer.innerHTML = `
          <div class="tooltip-content">
            <div class="tooltip-header" style="background-color: ${scoreColor};">
              <p class="selected-text">${truncateText(selectedText)}</p>
            </div>
            <div class="tooltip-body">
              <div class="tooltip-info">
                <p class="verdict" style="color: ${scoreColor};">${data.Verdict}</p>
                <p class="explanation">${data.Reasoning}</p>
                <div class="sources">${formattedSources}</div>
              </div>
              <div class="credibility-score" style="background-color: ${scoreColor};">
                <p class="score-label">Credibility</p>
                <p class="score-value">${score}</p>
              </div>
            </div>
          </div>
        `;
      })
      .catch(error => {
        tooltipContainer.innerHTML = `<div class="tooltip-content"><p>Error: ${error}</p></div>`;
      });
  
    // Clear selection to prevent re-triggering the selection handler
    window.getSelection()?.removeAllRanges();
  }
  
  function truncateText(text, wordCount = 6) {
    const words = text.trim().split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  }

  function handleSelection(event) {
    // If the event originated within the tooltip container, do nothing.
    if (tooltipContainer.contains(event.target)) return;
  
    const selection = window.getSelection();
    const text = selection?.toString().trim();
  
    if (text && text.length > 0) {
      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
  
      // Remove any previous tooltip content and add the icon button
      tooltipContainer.innerHTML = '';
      tooltipContainer.appendChild(createIconButton());
  
      // Determine vertical positioning:
      // If there's room below the selection, position below; otherwise, place it above.
      let topPos;
      const margin = 10; // space between selection and icon
      if (rect.bottom + 40 + margin < window.innerHeight) {
        // 40 is an estimated height of your icon button
        topPos = rect.bottom + margin;
      } else {
        topPos = rect.top - 40 - margin;
      }
  
      tooltipContainer.style.left = `${rect.left + rect.width / 2}px`;
      tooltipContainer.style.top = `${topPos}px`;
      tooltipContainer.style.display = 'block';
    }
  }
  
  function handleClickOutside(event) {
    if (!tooltipContainer.contains(event.target)) {
      tooltipContainer.style.display = 'none';
      window.getSelection()?.removeAllRanges();
    }
  }

  // Event listeners
  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('mousedown', handleClickOutside);
}

// Initialize the extension when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}
