import { INTENTS } from './ava/ava-types';

interface Message {
  intent: string;
  action: string;
  tabPosition?: number;
  website?: string;
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

chrome.runtime.onInstalled.addListener(() => {
  console.log('Ava installed');
});

chrome.runtime.onMessage.addListener((req: Message, sender) => {
  console.log('Message recieved: ', req);

  const { intent } = req;

  switch (intent) {
    case INTENTS.TAB:
      handleTabsIntent(req, sender);
      break;
    case INTENTS.REFRESH:
      handleRefreshIntent(sender);
      break;
    default:
      console.error('[background] - unhandled intent: ', intent);
  }
});
