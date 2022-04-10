import { INTENTS, Disposition, noop } from './ava/types';

export interface Message {
  intent: string;
  action?: string;
  tabPosition?: number;
  website?: string;
  search?: {
    disposition: Disposition;
    query: string;
  };
}

async function handleTabsIntent(
  message: Message,
  sender: chrome.runtime.MessageSender
) {
  const { action, tabPosition, website } = message;

  if (action === 'new') {
    if (website && sender.tab && sender.tab.id) {
      chrome.tabs.create({ url: `https://${website}` });
      return;
    }

    chrome.tabs.create({});
  }

  if (action === 'close') {
    if (tabPosition) {
      const tabs = await chrome.tabs.query({
        currentWindow: true,
      });

      const { id } = tabs[tabPosition - 1];

      if (id) {
        chrome.tabs.remove(id);
      }
    } else if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

  if (action === 'open') {
    if (tabPosition) {
      const tabs = await chrome.tabs.query({
        currentWindow: true,
      });

      const { id } = tabs[tabPosition - 1];

      if (id) {
        await chrome.tabs.update(id, { active: true });
      }
    }
  }
}

function handleRefreshIntent(sender: chrome.runtime.MessageSender) {
  if (sender && sender.tab && sender.tab.id) {
    chrome.tabs.reload(sender.tab.id);
  }
}

function handleNavigationIntent(
  req: Message,
  sender: chrome.runtime.MessageSender,
  response: (response?: string) => void
) {
  const { action } = req;

  if (!sender.tab || !sender.tab.id || !action) {
    return;
  }

  if ('back previous'.includes(action)) {
    chrome.tabs.goBack(sender.tab.id);
  } else if ('forward next'.includes(action)) {
    chrome.tabs.goForward(sender.tab.id);
  } else {
    response("I'm sorry could you repeat that?");
  }
}

function handleSearchIntent(
  req: Message,
  sender: chrome.runtime.MessageSender
) {
  const { search } = req;

  if (search) {
    const { disposition, query } = search;

    if (query && sender.tab && sender.tab.id && disposition) {
      chrome.search.query({ text: query, disposition }, noop);
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Ava installed');
});

chrome.runtime.onMessage.addListener((req: Message, sender, response) => {
  console.log('Message recieved: ', req);
  const { intent } = req;

  switch (intent) {
    case INTENTS.TAB:
      handleTabsIntent(req, sender);
      break;
    case INTENTS.REFRESH:
      handleRefreshIntent(sender);
      break;
    case INTENTS.NAVIGATION:
      handleNavigationIntent(req, sender, response);
      break;
    case INTENTS.SEARCH:
      handleSearchIntent(req, sender);
      break;
    default:
      response("I'm sorry could you repeat that?");
  }
});

const ports = new Map<number, chrome.runtime.Port>();

function handleOnActivated({ tabId }: chrome.tabs.TabActiveInfo) {
  ports.forEach((port, id) => {
    if (tabId === Number(id)) {
      port.postMessage(true);
    } else {
      port.postMessage(false);
    }
  });
}

chrome.tabs.onActivated.addListener(handleOnActivated);

chrome.runtime.onConnect.addListener((port) => {
  if (port.sender && port.sender.tab && port.sender.tab.id) {
    ports.set(port.sender.tab.id, port);
    port.onDisconnect.addListener(() => {
      if (port.sender && port.sender.tab && port.sender.tab.id) {
        ports.delete(port.sender?.tab.id);
      }
    });
  }
});
