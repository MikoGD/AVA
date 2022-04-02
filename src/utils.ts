import { Word } from '@speechly/react-client';
import { Tag } from './ava/ava-types';

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

/* Returns the scrollHeight of the tallest child and child itself of node given */
export function getMaxChildScrollHeight<T extends HTMLElement>(
  parent: T
): [number, HTMLElement] {
  const children = Array.from(parent.children);
  let maxScrollHeight = 0;
  let tallestChild: HTMLElement = parent;

  children.forEach((child) => {
    if (maxScrollHeight < child.scrollHeight) {
      maxScrollHeight = child.scrollHeight;
      tallestChild = child as HTMLElement;
    }
  });

  return [maxScrollHeight, tallestChild];
}

export function onScrollStopListener<T extends HTMLElement | Window>(
  element: T,
  onScrollCallback: () => void,
  waitDuration = 200
) {
  let timeout: NodeJS.Timeout | null = null;

  function handleOnScroll() {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(onScrollCallback, waitDuration);
  }

  element.addEventListener('scroll', handleOnScroll);

  return () => element.removeEventListener('scroll', handleOnScroll);
}

export function createTags(elementsToTag: Element[]) {
  const tags: Tag[] = [];

  elementsToTag.forEach((anchorElement: Element, index) => {
    const { left, top, width, height } = anchorElement.getBoundingClientRect();

    let x = left;
    let y = top;

    if (width < 50) {
      let leftPosition = left - 12.5;

      if (width < 25) {
        leftPosition = left - 25;
      }

      x = leftPosition < 0 ? 0 : leftPosition;
    }

    if (height < 50) {
      let topPosition = top - 12.5;

      if (height < 25) {
        topPosition = top - 25;
      }

      y = topPosition < 0 ? 0 : topPosition;
    }

    tags.push({
      style: { left: x, top: y },
      children: `${index}`,
    });
  });

  return tags;
}

function checkElementInView<T extends HTMLElement>(element: T) {
  const { top, left, bottom, right } = element.getBoundingClientRect();

  return (
    top >= 0 &&
    left >= 0 &&
    bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function validateAnchorTag(anchor: HTMLAnchorElement) {
  // const [maxHeight, scrollElement] = getMaxChildScrollHeight(document.body);

  if (!checkElementInView(anchor)) {
    return false;
  }

  const { visibility, display, overflow, textOverflow } =
    window.getComputedStyle(anchor);
  if (
    visibility === 'hidden' ||
    display === 'none' ||
    (overflow === 'hidden' && textOverflow !== 'ellipsis')
  ) {
    return false;
  }

  const ariaLabel = anchor.getAttribute('aria-label')?.trim();
  const titleAttr = anchor.getAttribute('title')?.trim();
  const text = anchor.innerText;

  if (!ariaLabel && !titleAttr && !text) {
    return false;
  }

  let parent = anchor.parentElement;
  const limit = 1;
  let count = 0;

  while (parent && count < limit) {
    const {
      visibility: parentVisibility,
      display: parentDisplay,
      overflow: parentOverflow,
      textOverflow: parentTextOverflow,
    } = window.getComputedStyle(parent);
    if (
      parentVisibility === 'hidden' ||
      parentDisplay === 'none' ||
      (parentOverflow === 'hidden' && parentTextOverflow !== 'ellipsis')
    ) {
      return false;
    }

    parent = parent.parentElement;
    count += 1;
  }

  return true;
}
