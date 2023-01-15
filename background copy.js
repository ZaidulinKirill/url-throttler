const delay = (ms) => {
  const startPoint = new Date().getTime();
  while (new Date().getTime() - startPoint <= ms) {
    /* wait */
  }
};

function matchRuleShort(str, rule) {
  return new RegExp(str.replace(/\*/g, "[^ ]*")).test(rule);
}

let isFirstCommentsRequest = true
let isDelayed = false

function updateChatDelay() {
  console.log('updateChatDelay')

  chrome.storage.local.get((state) => {
    if (!state.twitchChatDelay) {
      return;
    }

    const throttlerConfig = state.twitchChatDelay;
    if (handler) {
      chrome.webRequest.onBeforeRequest.removeListener(handler);
      handler = null;
    }

    if (!throttlerConfig.enabled) {
      return;
    }

    const urls = ["https://gql.twitch.tv/gql"];

    handler = (info) => {
     
      const matchedUrl = urls.filter((item) =>
        matchRuleShort(item, info.url)
      )[0];

      const requestBody = JSON.parse(decodeURIComponent(
        String.fromCharCode.apply(
          null,
          new Uint8Array(info.requestBody.raw[0].bytes)
        )
      ))

      requestBody.raw = null
      const isCommentsRequest = requestBody.find(x => x.operationName === 'VideoCommentsByOffsetOrCursor')

      if (!matchedUrl || !isCommentsRequest || isDelayed) {
        return
      }

      if (isFirstCommentsRequest) {
        console.log('skip', requestBody)
        isFirstCommentsRequest = false
        return
      }


      console.log('delay', requestBody);

      const thisUrlDelay = throttlerConfig.delay;
      delay(thisUrlDelay);

      isDelayed = true
      return;
    };

    chrome.webRequest.onBeforeRequest.addListener(
      handler,
      {
        urls: urls,
      },
      ["blocking", "requestBody"]
    );
  });
}

let handler;

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.hasOwnProperty("twitchChatDelay")) {
    updateChatDelay()
    return

    const throttlerConfig = changes.twitchChatDelay.newValue;
    if (handler) {
      chrome.webRequest.onBeforeRequest.removeListener(handler);
      handler = null;
    }

    // const urls = throttlerConfig.urls.filter((u) => !u.error && u.url !== '' && u.checked).map((u) => u.url.trim());
    const urls = ["https://gql.twitch.tv/gql"];

    if (throttlerConfig.enabled && urls.length > 0) {
      // chrome.browserAction.setIcon({ path: "icon48-warning.png" });
      handler = (info) => {
        console.log(
          decodeURIComponent(
            String.fromCharCode.apply(
              null,
              new Uint8Array(info.requestBody.raw[0].bytes)
            )
          )
        );
        //ex: {checked: true, delay: '10000', error: false, url: 'https://stackoverflow.com/tags'}
        const thisUrlConfig = urls.filter((item) =>
          matchRuleShort(item, info.url)
        )[0];

        if (thisUrlConfig) {
          const thisUrlDelay = throttlerConfig.delay;
          delay(thisUrlDelay);
        }
        return;
      };

      chrome.webRequest.onBeforeRequest.addListener(
        handler,
        // filters
        {
          urls: urls,
        },
        // extraInfoSpec
        ["blocking", "requestBody"]
      );
    } else {
      // chrome.browserAction.setIcon({ path: "icon48.png" });
    }
  }
});


chrome.tabs.onActivated.addListener(
  () => {
    isFirstCommentsRequest = true
    isDelayed = false
    updateChatDelay()
  },
)