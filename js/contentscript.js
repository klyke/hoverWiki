var popupID = "hoverWikiBox";
var paragraphID = "textPara";
var popupWidth = 400;
numCharacters = 500;
div = null;
para = null;
img = null;
extOn = true;
showing = false;
articlePrefix = "/wiki/";
articleNotFoundText = "Sorry, we couldn't find that article."
bodyContentID = "mw-content-text";


function start()
{
	$('[title]').removeAttr('title');
	addDiv();
	addMouseOverEvent();
	addMouseMoveEvent();
}

function toggleExtOn()
{
	extOn = !extOn;
}

function elementInBody(el)
{
	while(el && el.parentElement)
	{
		el = el.parentElement;
		if(el.id && el.id == bodyContentID)
		{
			return true;
		}
	}	
	return false;
}

function validLink(el)
{	
	var l = $(el).attr("href");
	var valid = false;
	var article = "";
	var currentSite = window.location.hostname;
	if(l.search("wikipedia.org") != -1 &&
		currentSite.search("wikipedia.org") == -1)
	{
		var items = l.split("/");
		if(items[items.length -2] == "wiki")
		{
			article = items.pop();
			valid = true;
		}
	}
	else
	{
		if(elementInBody(el) && 
		l.substring(0,6) == articlePrefix &&
		l.substring(6,10) != "File")
		{
			article = l.split("/").pop();
			valid = true;
		}
	}

	return [valid, article]

}

function addMouseOverEvent()
{
	$('a').hover(function(e)
	{
		if(!showing && extOn)
		{
			var el = e.currentTarget;
			var check  = validLink(el);
			var valid = check[0];
			var article = check[1];
			if(valid)
			{
				var x = parseInt(e.clientX, 10);
				var y = parseInt(e.clientY, 10);
				showLoader(x,y);
				getPreview(article);
			}
		}
	}, function(){
		makeInvisible();
	});
}

function addMouseMoveEvent()
{
	$(document).mousemove(function(e)
	{
		if(showing)
		{
			offY = parseInt(window.pageYOffset, 10);
			offX = parseInt(window.pageXOffset, 10);
			var x = e.clientX - offX;
			var y = e.clientY + offY;

			var divX = parseInt(div.style.left, 10);
			var divY = parseInt(div.style.top, 10);

			var deltaX = divX - x;
			var deltaY = divY - y;

			div.style.left = divX - deltaX + "px";
			div.style.top = divY - deltaY + "px";
		}
	});
}

function getPreview(article, x, y)
{
	var url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&redirects&explaintext=&titles="+ article;
	$.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        async: true,
        dataType: "json",
        success: function (data, textStatus, jqXHR) 
        {
        	try
        	{    
        		var pagesObj = data["query"]["pages"];
        		var articleID = Object.keys(pagesObj)[0];
        		var text = pagesObj[articleID]["extract"];
        		firstParagraph = text.split("\n")[0];
	           	setText(firstParagraph);
        	}
        	catch(err)
        	{
        		setText(articleNotFoundText);
        	}

        },
        error: function (errorMessage) {
        	console.log("Error retrieving data for " + article);
        }
    });

}

function setText(text)
{
	if(text.length > numCharacters)
		text = text.substring(0, numCharacters) + "...";

	img.style.display = "None";
	var node = document.createTextNode(text);
	para.innerHTML = "";
	para.style.fontSize = "16px";
	div.style.width = popupWidth + "px";
	para.appendChild(node);

	divHeight = parseInt(div.clientHeight, 10);

	pageHeight = parseInt(document.body.clientHeight, 10);
	pageWidth = parseInt(document.body.clientWidth, 10);

	offY = parseInt(window.pageYOffset, 10);
	offX = parseInt(window.pageXOffset, 10);

	divY = parseInt(div.style.top,10);
	divX = parseInt(div.style.left, 10);
	

	relativeY = divY - offY;
	if(relativeY + divHeight > pageHeight)
		div.style.top = divY - divHeight + "px";

	relativeX = divX - offX;
	if(relativeX + popupWidth > pageWidth)
		div.style.left = relativeX - popupWidth + "px";


}

function showLoader(x,y)
{
	showing = true;

	offY = parseInt(window.pageYOffset, 10);
	offX = parseInt(window.pageXOffset, 10);

	x += offX;
	y += offY;

	div.style.left = x+"px";
	div.style.top = y+"px";

	div.style.width = "auto"
	div.style.height = "auto"
	img.style.display = "inline-block";


	makeVisible()
}

function addDiv()
{
	var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
	if (!location.ancestorOrigins.contains(extensionOrigin)) 
	{
		div = document.createElement("div");
		div.class = popupID;
		div.style.cssText = "display: None; position: absolute; box-shadow: 5px 5px 5px #888888;"
		div.style.backgroundColor = "#D3D3D3";
		div.style.borderRadius = "10px";
		div.style.padding = "10px";
		// div.style.width = popupWidth + "px";
		div.style.width = "auto";
		div.style.maxWidth = popupWidth + "px";
		para = document.createElement("p");
		para.id = paragraphID;
		div.appendChild(para);
		img = document.createElement("img")
		img.src = chrome.extension.getURL("./ajax-loader.gif");
		img.id = "loadingGif";
		img.style.display = "inline-block";

		div.appendChild(img);

		$(document.body).append(div);
	}
}

function makeVisible()
{
	div.style.display = "inline-block";
}

function makeInvisible()
{
	para.innerHTML = "";
	div.clientWidth = 0
	div.clientHeight = 0
	div.style.display = "None";
	showing = false;
}

$(document).ready(function(){
	start();
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.callFunction)
		{
			if(request.callFunction == "toggleExtOn")
				toggleExtOn();
		}
			
	});
