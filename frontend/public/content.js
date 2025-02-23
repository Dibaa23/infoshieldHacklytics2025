// ================================
// Selected Text Fact-Check Tooltip
// ================================
function initializeExtension() {
  // Create tooltip container for text selection
  const tooltipContainer = document.createElement('div');
  tooltipContainer.className = 'credibility-tooltip-container';
  document.body.appendChild(tooltipContainer);

  let selectedText = '';

  function createIconButton() {
    const button = document.createElement('button');
    button.className = 'info-button';

    const logo = document.createElement('img');
    // Use chrome.runtime.getURL to correctly reference the icon in your extension
    logo.src = chrome.runtime.getURL('icon48.png');
    logo.alt = 'InfoShield Logo';
    // Adjust size to fit your 40x40 button
    logo.style.width = '24px';
    logo.style.height = '24px';

    button.appendChild(logo);
    // When clicked, call the fact-check endpoint and display the tooltip
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

    // Call your backend fact-check endpoint using the selected text
    fetch("http://127.0.0.1:8000/fact-check", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selectedText })
    })
      .then(response => response.json())
      .then(data => {
        // Process returned sources into clickable links
        const formattedSources = data.Sources
          .map(src => {
            const match = src.match(/\[(.*?)\]\((.*?)\)/);
            return match ? `<a href="${match[2]}" target="_blank">${match[1]}</a>` : src;
          })
          .join('<br>');

        // Determine dynamic color based on the credibility score
        const score = data["Credibility Score"];
        let scoreColor;
        if (score < 50) {
          scoreColor = 'rgb(139, 0, 0)';
        } else if (score < 70) {
          scoreColor = 'rgb(173, 134, 36)';
        } else if (score >= 80) {
          scoreColor = 'rgb(0, 139, 16)';
        } else {
          scoreColor = 'rgb(173, 124, 0)';
        }

        // Inject the tooltip content with inline dynamic styling
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

    // Clear selection to prevent retriggering
    window.getSelection()?.removeAllRanges();
  }

  function truncateText(text, wordCount = 6) {
    const words = text.trim().split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  }

  function handleSelection(event) {
    // Do not trigger if clicking the Major Issues button or inside the tooltip container
    if (event.target.closest('.major-issues-button')) return;
    if (tooltipContainer.contains(event.target)) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      tooltipContainer.innerHTML = '';
      tooltipContainer.appendChild(createIconButton());

      // Determine vertical positioning (below if room, else above)
      let topPos;
      const margin = 10;
      if (rect.bottom + 40 + margin < window.innerHeight) {
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

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('mousedown', handleClickOutside);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// -------------------------------------------------
// Major Issues Modal for Article Analysis
// -------------------------------------------------

// Global variable to reference the Major Issues button so we can restore it later.
let majorIssuesBtn;

// Function to set the Major Issues button to a loading state (spinner)
function setMajorIssuesButtonLoading(isLoading) {
  if (!majorIssuesBtn) return;
  if (isLoading) {
    // Replace the button's inner content with a spinner
    majorIssuesBtn.innerHTML = `<div class="tooltip-loading" style="margin: auto;"></div>`;
  } else {
    // Restore the button text
    majorIssuesBtn.textContent = 'Major Issues';
  }
}

// Function to open the Major Issues modal with analysis results
function openMajorIssuesWindow(issues) {
  // Remove any existing modal
  const existingModal = document.getElementById('major-issues-modal');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'major-issues-modal';
  overlay.className = 'major-issues-modal';

  // Modal header with title and close (X) button
  const header = document.createElement('div');
  header.className = 'major-issues-header';
  const title = document.createElement('span');
  title.textContent = 'Major Issues';
  header.appendChild(title);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-modal';
  closeBtn.textContent = 'X';
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(closeBtn);
  overlay.appendChild(header);

  // Modal content container
  const content = document.createElement('div');
  content.className = 'major-issues-content';

  // If issues data is a simple message (e.g., "No false information detected.")
  if (typeof issues[0] === "string") {
    const msg = document.createElement('p');
    msg.textContent = "No Major Issues";
    content.appendChild(msg);
  } else {
    // For each problematic issue, display the sentence, score, and reasoning
    issues.forEach(issue => {
      const issueDiv = document.createElement('div');
      issueDiv.className = 'issue-item';

      const sentence = document.createElement('p');
      sentence.className = 'issue-sentence';
      sentence.textContent = issue["Problematic Sentence"];

      const score = document.createElement('span');
      score.className = 'issue-score';
      score.textContent = `Score: ${issue["Credibility Score"]}`;

      const reasoning = document.createElement('p');
      reasoning.className = 'issue-reasoning';
      reasoning.textContent = issue["Reasoning"];

      issueDiv.appendChild(sentence);
      issueDiv.appendChild(score);
      issueDiv.appendChild(reasoning);
      content.appendChild(issueDiv);
    });
  }

  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

// Create and inject the persistent "Major Issues" button
function createMajorIssuesButton() {
  majorIssuesBtn = document.createElement('button');
  majorIssuesBtn.className = 'major-issues-button';
  majorIssuesBtn.textContent = 'Major Issues';
  majorIssuesBtn.addEventListener('click', () => {
    // Set the button to loading state (spinner)
    setMajorIssuesButtonLoading(true);
    // Remove any existing modal (if present)
    const existingModal = document.getElementById('major-issues-modal');
    if (existingModal) existingModal.remove();

    // Call the analyze_article endpoint with the current page URL
    fetch("http://127.0.0.1:8000/analyze-article", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.href })
    })
      .then(response => response.json())
      .then(data => {
        // Open modal with results
        openMajorIssuesWindow(data);
        // Restore the button to its original state
        setMajorIssuesButtonLoading(false);
      })
      .catch(error => {
        openMajorIssuesWindow([{ "Problematic Sentence": "Error analyzing page.", "Credibility Score": 0, "Reasoning": error.toString() }]);
        setMajorIssuesButtonLoading(false);
      });
  });
  document.body.appendChild(majorIssuesBtn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createMajorIssuesButton);
} else {
  createMajorIssuesButton();
}

// -------------------------------------------------
// (Optional) Message Listener for Highlighting Problematic Sentences
// -------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightProblematic") {
    if (Array.isArray(request.payload)) {
      const data = request.payload;
      if (typeof data[0] === "string") {
        alert(data[0]);
        return;
      }
      highlightProblematicSentences(data);
    }
  }
});

// ------------------------------
// Highlighting Problematic Sentences
// ------------------------------
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkAndHighlight(node, sentence, score, reasoning) {
  if (!node) return;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const escapedSentence = escapeRegExp(sentence);
    const regex = new RegExp(escapedSentence, 'g');

    if (regex.test(text)) {
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const before = text.substring(lastIndex, match.index);
        frag.appendChild(document.createTextNode(before));

        const span = document.createElement('span');
        span.className = 'problematic-sentence';
        span.dataset.score = score;
        span.dataset.reasoning = reasoning;
        span.textContent = match[0];
        frag.appendChild(span);

        lastIndex = regex.lastIndex;
      }
      frag.appendChild(document.createTextNode(text.substring(lastIndex)));
      node.parentNode.replaceChild(frag, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
    Array.from(node.childNodes).forEach(child => {
      walkAndHighlight(child, sentence, score, reasoning);
    });
  }
}

function highlightText(sentence, score, reasoning) {
  console.log("Highlighting sentence:", sentence);
  walkAndHighlight(document.body, sentence, score, reasoning);
}

function highlightProblematicSentences(problematicArray) {
  problematicArray.forEach(item => {
    const sentence = item["Problematic Sentence"];
    const score = item["Credibility Score"];
    const reasoning = item["Reasoning"];
    console.log("Processing:", sentence, "Score:", score);
    highlightText(sentence, score, reasoning);
  });
}
