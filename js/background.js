logoOn = true;

chrome.runtime.onInstalled.addListener(function()
{
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function()
	{
		chrome.declarativeContent.onPageChanged.addRules([
		{
			conditions:[
			new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {urlContains: ""},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

chrome.pageAction.onClicked.addListener(function(tab)
{
	logoOn = !logoOn;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tab.id, {callFunction:"toggleExtOn"});
	});

        //Change Icon
    if(logoOn)
		chrome.pageAction.setIcon({tabId: tab.id, path: "wikiHoverLogo48.png"});
	else
		chrome.pageAction.setIcon({tabId: tab.id, path: "wikiHoverLogo48off.png"});
});
