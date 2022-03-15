import { Word } from '@speechly/browser-client';

export function wordsToSentence(words: Word[]) {
  let firstWord = true;
  return words.reduce((currSentence, word) => {
    if (!word) {
      return currSentence;
    }

    const currWord = word.value.toLowerCase();

    if (firstWord) {
      firstWord = false;
      const wordArr = Array.from(currWord);
      wordArr[0] = wordArr[0].toUpperCase();

      return wordArr.join('');
    }

    return `${currSentence} ${currWord}`;
  }, '');
}

/* Returns the scrollHeight of the tallest child of node given */
export function getMaxChildScrollHeight<T extends HTMLElement>(parent: T) {
  const children = Array.from(parent.children);
  let maxScrollHeight = 0;

  children.forEach((child) => {
    if (maxScrollHeight < child.scrollHeight) {
      maxScrollHeight = child.scrollHeight;
    }
  });

  return maxScrollHeight;
}
