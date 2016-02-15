chrome.app.runtime.onLaunched.addListener(function() {
  // Tell your app what to launch and how.
 // alert("Here we crawl!");
});

chrome.runtime.onSuspend.addListener(function() {
  // Do some simple clean-up tasks.
});
