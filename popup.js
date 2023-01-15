
chrome.storage.local.get(['twitchChatDelay'], (result) => {
  const data = Object.assign(
    {}, {
      enabled: false,
      delay: 0,
    },
    result.twitchChatDelay
  );
  var app = new Vue({
    el: '#app',
    data: data,
    methods: {
      applyConfig: function() {
        console.log('applyConfig: ', this.enabled)

        if (!this.enabled) {
          console.log('remove twitchChatDelay')
          chrome.storage.local.remove('twitchChatDelay', () => {
            console.log('reload')
            chrome.tabs.reload();
            window.close();
          })
          return
        }

        chrome.storage.local.set({ twitchChatDelay: { delay: this.delay, enabled: true } }, () => {
          chrome.tabs.reload();
          window.close();
        })
      },
    }
  });
});
