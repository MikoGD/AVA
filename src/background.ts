chrome.runtime.onInstalled.addListener(() => {
  console.log('Ava installed');
  // chrome.tabs.create({
  //   url: `chrome://extensions/?options=${chrome.runtime.id}`,
  // });
});
