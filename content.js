const injectedScript =
  "(" +
  function () {
    console.log("Script Injected");
    // define monkey patch function
    const monkeyPatch = () => {
      let oldXHROpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function () {
          const responseBody = this.responseText;
          console.log(`Response Body: ${responseBody}`);
        });
        return oldXHROpen.apply(this, arguments);
      };
    };
    monkeyPatch();
  } +
  ")();";
const injectScript = () => {
  console.log("Injecting Script");
  var script = document.createElement("script");
  script.textContent = injectedScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};
setTimeout(injectScript, 1000);
