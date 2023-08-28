const copyThroughInput = (text: string) => {
  let isSuccess = false;
  const textArea = document.createElement('span');

  const range = document.createRange();
  const selection = document.getSelection();
  if (!selection) {
    return false;
  }

  textArea.textContent = text;
  // avoid screen readers from reading out loud the text
  textArea.ariaHidden = 'true';
  // reset user styles for span element
  textArea.style.all = 'unset';
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.clip = 'rect(0, 0, 0, 0)';
  // used to preserve spaces and line breaks
  textArea.style.whiteSpace = 'pre';
  // do not inherit user-select (it may be `none`)
  textArea.style.webkitUserSelect = 'text';
  textArea.style.userSelect = 'text';

  document.body.appendChild(textArea);
  range.selectNodeContents(textArea);
  try {
    selection.addRange(range);
    isSuccess = document.execCommand('copy');
    console.debug('copied to clipboard!');

    if (typeof selection.removeRange == 'function') {
      selection.removeRange(range);
    } else {
      selection.removeAllRanges();
    }
  } catch (err) {
    console.error('copy error');
  }
  document.body.removeChild(textArea);
  return isSuccess;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.debug('copied to clipboard!');
    return true;
  } catch {
    console.error('copy error');
    return copyThroughInput(text);
  }
};
