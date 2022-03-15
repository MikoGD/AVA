import { Segment } from '@speechly/browser-client';
import { getMaxChildScrollHeight } from '../utils';

function handlePositionScroll(position: string) {
  const body = document.getElementsByTagName('body')[0];
  let maxHeight = body.scrollHeight;

  if (maxHeight === 0) {
    maxHeight = getMaxChildScrollHeight(body);
  }

  let scrollOptions: ScrollToOptions = {
    behavior: 'smooth',
  };

  switch (position) {
    case 'top':
      scrollOptions = { ...scrollOptions, top: 0 };
      break;
    case 'bottom':
      scrollOptions = { ...scrollOptions, top: maxHeight };
      break;
    default:
      console.error('unhandled scroll position');
  }

  window.scrollTo(scrollOptions);
}

function handleDirectionScroll(direction: string) {
  const verticalIncrement = 500;
  const horizontalIncrement = 250;
  let scrollOptions: ScrollToOptions = {
    top: 0,
    left: 0,
    behavior: 'smooth',
  };

  switch (direction) {
    case 'up':
      scrollOptions = { ...scrollOptions, top: -verticalIncrement };
      break;
    case 'down':
      scrollOptions = { ...scrollOptions, top: verticalIncrement };
      break;
    case 'left':
      scrollOptions = { ...scrollOptions, left: -horizontalIncrement };
      break;
    case 'right':
      scrollOptions = { ...scrollOptions, left: horizontalIncrement };
      break;
    default:
      console.error('unhandled scroll direction: ', direction);
  }

  window.scrollBy(scrollOptions);
}

function handleScrollIntent(segment: Segment) {
  const { entities } = segment;
  console.log('[scroll] - entities', entities);
  switch (entities[0].type) {
    case 'position':
      handlePositionScroll(entities[0].value.toLowerCase());
      break;
    case 'direction':
      handleDirectionScroll(entities[0].value.toLowerCase());
      break;
    default:
      console.error('unhandled scroll entities: ', entities);
  }
}

export function processSegment(segment: Segment) {
  switch (segment.intent.intent) {
    case 'open_website':
      window.location.href = `https://${segment.entities[0].value.toLowerCase()}.com`;
      break;
    case 'scroll':
      handleScrollIntent(segment);
      break;
    default:
      console.error('unhandled intent: ', segment.intent.intent);
  }
}
