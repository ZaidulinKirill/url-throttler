
console.log('jere')
const data = Object.assign(
  {},
  {
    enabled: false,
    delay: 0,
  },
);
var app = new Vue({
  el: "#app",
  data: data,
  created() {
    chrome.storage.local.get().then(result => {
      console.log('res', result)
      this.delay = result.delay
      this.enabled = result.enabled
    })
  },
  methods: {
    applyConfig: function () {
      console.log('here')
      console.log("applyConfig: ", this.enabled);

      if (!this.enabled) {
        chrome.storage.local.remove("twitchChatDelay", () => {
          console.log("reload");
          chrome.tabs.reload();
          window.close();
        });
        return;
      }

      // chrome.runtime.sendMessage({
      //   "chat-delay": {
      //     delay: this.delay,
      //     enabled: this.enabled,
      //   },
      // });

      chrome.storage.local.set(
        { twitchChatDelay: { delay: this.delay, enabled: true } },
        () => {
          chrome.tabs.reload();
          window.close();
        }
      );
    },
  },
});

document.querySelector('#submit').onclick = () => {
  console.log('here')
}