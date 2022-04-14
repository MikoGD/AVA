import { Word } from '@speechly/react-client';
import { ValidTag } from './ava/tags';
import { Message } from './background';

type AvailableInputTypesStr =
  | 'button'
  | 'input'
  | 'select'
  | 'option'
  | 'textarea';

type AvailableInputTypes =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLOptionElement
  | HTMLTextAreaElement;

export const ariaTextRoles = 'textbox combobox';
export const ariaClickRoles = 'button checkbox';

export function wordsToSentence(words: Word[]) {
  let firstWord = true;
  return words
    .reduce((currSentence, word) => {
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
    }, '')
    .trim();
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

/* Due to how different taggable element sizes are the tags could get in the way
 * of the element. This algorithm allows for some room for the tags to move out
 * of the element's way.
 */
export function getTagPosition(elementToTag: Element) {
  const { left, top, width, height } = elementToTag.getBoundingClientRect();
  const tagDiameter = 50;
  const tagRadius = tagDiameter / 2;

  let x = left;
  let y = top;

  if (width < tagDiameter) {
    let leftPosition = left - tagRadius / 2;

    if (width < tagRadius) {
      leftPosition = left - tagRadius;
    }

    x = leftPosition < 0 ? 0 : leftPosition;
  }

  if (height < tagDiameter) {
    let topPosition = top - tagRadius / 2;

    if (height < tagRadius) {
      topPosition = top - tagRadius;
    }

    y = topPosition < 0 ? 0 : topPosition;
  }

  return [x, y];
}

function checkElementInView<T extends HTMLElement>(element: T) {
  const boundingClient = element.getBoundingClientRect();
  // Adjust coordinates to get more accurate results
  const left = boundingClient.left + 1;
  const top = boundingClient.top + 1;

  const isTopGreater = top >= 0;
  const isLeftGreater = left >= 0;

  // Don't care if the right side or bottom of the element is not in view
  return isTopGreater && isLeftGreater;
}

function checkElementIsVisible<T extends HTMLElement>(element: T) {
  const { visibility, display, overflow, textOverflow } =
    window.getComputedStyle(element);

  if (
    visibility === 'hidden' ||
    display === 'none' ||
    (overflow === 'hidden' && !'ellipsis clip'.includes(textOverflow))
  ) {
    return false;
  }

  return true;
}

function checkElementIsOverlapped<T extends HTMLElement>(element: T) {
  const boundingRect = element.getBoundingClientRect();
  // Adjust coordinates to get more accurate results
  const left = boundingRect.left + 1;
  const right = boundingRect.right - 1;
  const top = boundingRect.top + 1;
  const bottom = boundingRect.bottom - 1;

  const coords = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ];

  const isOverlapped = coords.map(([x, y]) => {
    const overlappingElement = document.elementFromPoint(x, y);
    const isOverlappingElementParent =
      overlappingElement === element.parentElement;
    const isChildOfElement = element.contains(overlappingElement);

    if (
      !isOverlappingElementParent &&
      !isChildOfElement &&
      overlappingElement &&
      overlappingElement !== element
    ) {
      return true;
    }

    return false;
  });

  return isOverlapped.every((corner) => corner);
}

function checkElementVisibleOnScreen<T extends HTMLElement>(element: T) {
  const isInView = checkElementInView(element);
  const isVisibile = checkElementIsVisible(element);
  const isOverlapped = checkElementIsOverlapped(element);

  return isInView && isVisibile && !isOverlapped;
}

/* A valid tag is a tag that has a aria-label, title or text. It also needs to
 * be visible to the user.
 */
export function validateAnchorTag(anchor: HTMLAnchorElement) {
  if (!checkElementVisibleOnScreen(anchor)) {
    return false;
  }

  const ariaLabel = anchor.getAttribute('aria-label')?.trim();
  const titleAttr = anchor.getAttribute('title')?.trim();
  const text = anchor.innerText;

  if (!ariaLabel && !titleAttr && !text) {
    return false;
  }

  let parent = anchor.parentElement;
  const limit = 5;
  let count = 0;
  let isDocumentElement = parent === document.documentElement;
  let isBody = parent === document.body;

  /* Checks if all ancestor is in view as the child can only be visible if the
   * The ancestors are in view
   */
  while (parent && count < limit && !isDocumentElement && !isBody) {
    if (!checkElementVisibleOnScreen(parent)) {
      return false;
    }

    parent = parent.parentElement;
    isDocumentElement = parent === document.documentElement;
    isBody = parent === document.body;
    count += 1;
  }

  return true;
}

export function getValidAnchorTags(
  startingIndex: number
): [ValidTag[], number] {
  const newValidTags: ValidTag[] = [];
  let index = startingIndex;

  Array.from(document.getElementsByTagName('a')).forEach((tag) => {
    const isValidAnchorTag = validateAnchorTag(tag);

    if (isValidAnchorTag) {
      const ariaLabel = tag.getAttribute('aria-label')?.trim();
      const titleAttr = tag.getAttribute('title')?.trim();
      const text = tag.innerText.trim();

      // Display text is for the tags modal to show the tag
      let displayText = '';

      if (ariaLabel) {
        displayText = ariaLabel;
      } else if (titleAttr) {
        displayText = titleAttr;
      } else {
        displayText = text;
      }

      const id = `${index}${displayText}`;

      if (displayText) {
        const validTag: ValidTag = {
          id,
          index,
          displayText,
          node: tag,
        };

        newValidTags.push(validTag);
        index += 1;
      }
    }
  });

  return [newValidTags, index];
}

function getInputElementsArr<T extends HTMLElement | HTMLTextAreaElement>(
  inputType: AvailableInputTypesStr
): T[] {
  const inputElements = document.getElementsByTagName(
    inputType
  ) as HTMLCollectionOf<T>;
  return Array.from<T>(inputElements);
}

function validateInputTag(input: AvailableInputTypes) {
  return checkElementVisibleOnScreen(input);
}

// Valid input elements are input elements visible to the user
export function getValidInputElements(
  startingIndex: number
): [ValidTag[], number] {
  const newValidTags: ValidTag[] = [];
  let index = startingIndex;
  const inputElements: AvailableInputTypesStr[] = [
    'button',
    'input',
    'option',
    'textarea',
  ];

  inputElements.forEach((tagName) => {
    const currInputElements = getInputElementsArr<AvailableInputTypes>(tagName);

    currInputElements.forEach((currInputElement) => {
      if (validateInputTag(currInputElement)) {
        const id = `${index}${currInputElement.innerText}`;

        const newValidTag: ValidTag = {
          id,
          index,
          displayText: currInputElement.innerText,
          node: currInputElement,
        };

        newValidTags.push(newValidTag);
        index += 1;
      }
    });
  });

  return [newValidTags, index];
}

export function validateDivTag(div: HTMLDivElement) {
  return checkElementVisibleOnScreen(div);
}

// Some divs are clickable and have controls to them. These divs are valid tags
export function getValidDivElements(
  startingIndex: number
): [ValidTag[], number] {
  const newValidTags: ValidTag[] = [];
  let index = startingIndex;

  const divElements = Array.from<HTMLDivElement>(
    document.getElementsByTagName('div')
  ).filter((div) => {
    const hasOnClick = Boolean(div.onclick);
    const isControl = Boolean(
      Array.from(div.attributes).find((attr) => {
        if (
          attr.name === 'aria-controls' ||
          (attr.name === 'role' &&
            ariaTextRoles.includes(attr.value.toLowerCase()))
        ) {
          return true;
        }
        return false;
      })
    );

    if (hasOnClick || isControl) {
      return true;
    }

    return false;
  });

  divElements.forEach((div) => {
    if (validateDivTag(div)) {
      const id = `${index}{div.innertText}`;

      const newValidTag: ValidTag = {
        id,
        index,
        displayText: div.innerText,
        node: div,
      };

      newValidTags.push(newValidTag);
      index += 1;
    }
  });

  return [newValidTags, index];
}

export function getValidTagsFromPage() {
  let allValidTags: ValidTag[] = [];
  let index = 0;
  const getValidTagFunctions = [
    getValidAnchorTags,
    getValidInputElements,
    getValidDivElements,
  ];

  getValidTagFunctions.forEach((fn) => {
    const [newValidTags, newIndex] = fn(index);
    index = newIndex;
    allValidTags = [...allValidTags, ...newValidTags];
  });

  return allValidTags.sort((a: ValidTag, b: ValidTag) => {
    if (a.index < b.index) {
      return -1;
    }

    if (a.index > b.index) {
      return 1;
    }

    return 0;
  });
}

let updateTimer: NodeJS.Timeout | null = null;

export function updateTags(updateCallback: () => void) {
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    updateCallback();
    updateTimer = null;
  }, 300);
}

export function sendMessageToBackground(
  message: Message,
  responseCallback?: (response: string) => void
) {
  chrome.runtime.sendMessage(message, (response: string) => {
    if (responseCallback) {
      responseCallback(response);
    } else {
      throw new Error(response);
    }
  });
}
