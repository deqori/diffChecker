  // Main function to generate the diff output
  function generateDiff() {
    // Split text into arrays of lines
    const leftLines = document.getElementById('leftInput').value.split('\n');
    const rightLines = document.getElementById('rightInput').value.split('\n');
    
    // Clear the previous diff result
    const diffContainer = document.getElementById('diff');
    diffContainer.innerHTML = '';

    // Align lines from both inputs
    const [leftAligned, rightAligned] = alignLines(leftLines, rightLines);

    // Create two columns (left and right)
    const leftCol = document.createElement('div');
    leftCol.className = 'column';
    const rightCol = document.createElement('div');
    rightCol.className = 'column';

    // Line counters for numbering
    let leftNum = 1;
    let rightNum = 1;

    // Loop through aligned lines
    for (let i = 0; i < leftAligned.length; i++) {
      const l = leftAligned[i];
      const r = rightAligned[i];

      // Containers for each line
      const leftLine = document.createElement('div');
      const rightLine = document.createElement('div');
      leftLine.className = 'line';
      rightLine.className = 'line';

      // Line number and content elements
      const leftNumber = document.createElement('div');
      const leftContent = document.createElement('div');
      leftNumber.className = 'line-number';
      leftContent.className = 'line-content';

      const rightNumber = document.createElement('div');
      const rightContent = document.createElement('div');
      rightNumber.className = 'line-number';
      rightContent.className = 'line-content';

      // LEFT COLUMN processing
      if (l === null) { // No line on the left
        leftLine.classList.add('empty');
        leftNumber.innerText = '';
        leftContent.innerText = '';
      } else if (r === null || l !== r) { // Line deleted or different
        leftLine.classList.add('removed');
        leftNumber.innerText = leftNum++;
        // Highlight word-level differences
        if (r !== null) {
          leftContent.innerHTML = highlightWordDifferences(l, r, 'removed');
        } else {
          leftContent.innerText = l;
        }
      } else { // Line is identical
        leftNumber.innerText = leftNum++;
        leftContent.innerText = l;
      }

      // RIGHT COLUMN processing
      if (r === null) { // No line on the right
        rightLine.classList.add('empty');
        rightNumber.innerText = '';
        rightContent.innerText = '';
      } else if (l === null || l !== r) { // Line added or different
        rightLine.classList.add('added');
        rightNumber.innerText = rightNum++;
        // Highlight word-level differences
        if (l !== null) {
          rightContent.innerHTML = highlightWordDifferences(r, l, 'added');
        } else {
          rightContent.innerText = r;
        }
      } else { // Line is identical
        rightNumber.innerText = rightNum++;
        rightContent.innerText = r;
      }

      // Append numbers and contents to each line
      leftLine.appendChild(leftNumber);
      leftLine.appendChild(leftContent);
      rightLine.appendChild(rightNumber);
      rightLine.appendChild(rightContent);

      // Append lines to their respective columns
      leftCol.appendChild(leftLine);
      rightCol.appendChild(rightLine);
    }

    // Append both columns to the diff container
    diffContainer.appendChild(leftCol);
    diffContainer.appendChild(rightCol);
  }

  // Highlight word-level differences inside a line
  function highlightWordDifferences(currentLine, otherLine, type) {
    if (!currentLine || !otherLine) return currentLine || '';
    
    const currentWords = currentLine.split(/(\s+)/);
    const otherWords = otherLine.split(/(\s+)/);
    const maxLength = Math.max(currentWords.length, otherWords.length);
    
    let result = '';
    
    for (let i = 0; i < maxLength; i++) {
      const currentWord = currentWords[i] || '';
      const otherWord = otherWords[i] || '';
      
      if (currentWord !== otherWord && currentWord.trim() !== '') {
        // Apply highlighting for added/removed words
        const className = type === 'added' ? 'word-added' : 'word-removed';
        result += `<span class="${className}">${escapeHtml(currentWord)}</span>`;
      } else {
        result += escapeHtml(currentWord);
      }
    }
    
    return result;
  }

  // Escape HTML to prevent XSS injection
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Align lines from left and right inputs to detect insertions/deletions
  function alignLines(left, right) {
    const lLen = left.length;
    const rLen = right.length;

    const lAligned = [];
    const rAligned = [];

    let i = 0, j = 0;

    while (i < lLen || j < rLen) {
      const lLine = left[i] || null;
      const rLine = right[j] || null;

      if (lLine === rLine) { // Identical lines
        lAligned.push(lLine);
        rAligned.push(rLine);
        i++;
        j++;
      } else {
        let found = false;
        // Look ahead up to 3 lines to detect shifts
        for (let offset = 1; offset <= 3; offset++) {
          if (left[i + offset] === rLine) {
            // Shift detected on left side
            for (let k = 0; k < offset; k++) {
              lAligned.push(left[i + k]);
              rAligned.push(null);
            }
            i += offset;
            found = true;
            break;
          } else if (right[j + offset] === lLine) {
            // Shift detected on right side
            for (let k = 0; k < offset; k++) {
              lAligned.push(null);
              rAligned.push(right[j + k]);
            }
            j += offset;
            found = true;
            break;
          }
        }
        // If no shift found, mark lines as different
        if (!found) {
          lAligned.push(lLine);
          rAligned.push(rLine);
          i++;
          j++;
        }
      }
    }

    return [lAligned, rAligned];
  }