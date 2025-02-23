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
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    `;
    
    // On click, fetch fact-check data from the backend and update the tooltip
    button.addEventListener('click', showTooltipContent);
    return button;
  }

  function showTooltipContent(event) {
    event.stopPropagation();
    
    // Position tooltip in center of viewport while fetching backend data
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    tooltipContainer.style.left = `${viewportWidth / 2}px`;
    tooltipContainer.style.top = `${viewportHeight / 2}px`;
    
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
  
        tooltipContainer.innerHTML = `
          <div class="tooltip-content">
            <div class="tooltip-header">
              <p class="selected-text">${truncateText(selectedText)}</p>
            </div>
            <div class="tooltip-body">
              <div class="tooltip-info">
                <p class="verdict">${data.Verdict}</p>
                <p class="explanation">${data.Reasoning}</p>
                <div class="sources">${data.Sources}</div>
              </div>
              <div class="credibility-score">
                <p class="score-label">Credibility</p>
                <p class="score-value">${data["Credibility Score"]}</p>
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
      
      // Position icon near selected text
      tooltipContainer.style.left = `${rect.left + (rect.width / 2)}px`;
      tooltipContainer.style.top = `${rect.bottom + 10}px`;
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
