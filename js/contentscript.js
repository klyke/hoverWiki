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

function start()
{
	$('[title]').removeAttr('title');
	addDiv();
	addMouseOverEvent();
}

function addMouseOverEvent()
{
	$('a').hover(function(e){
		var link = $(this).attr("href");
		if(!showing && link.substring(0,6) == articlePrefix)
		{
			var x = parseInt(e.clientX, 10);
			var y = parseInt(e.clientY, 10);
			var article = link.split("/").pop();
			showLoader(x,y);
			getPreview(article);
		}
	}, function(){
		makeInvisible();
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
	div.style.width = popupWidth + "px";
	para.appendChild(node);

	divHeight = parseInt(div.clientHeight, 10);
	pageHeight = parseInt(document.body.clientHeight, 10);
	pageY = parseInt(window.pageYOffset, 10);
	divY = parseInt(div.style.top,10);
	relativeY = divY - pageY;
	if(relativeY + divHeight > pageHeight)
		div.style.top = divY - divHeight + "px";
}

function showLoader(x,y)
{
	showing = true;
	pageY = parseInt(window.pageYOffset, 10);
	pageX = parseInt(window.pageXOffset, 10);

	pageWidth = parseInt(document.body.clientWidth, 10);
	pageHeight = parseInt(document.body.clientHeight, 10);

	divHeight = parseInt(div.clientHeight, 10);

	x += pageX;
	y += pageY;

	if(x + popupWidth > pageWidth)
		x -= popupWidth;

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
	showing = false;
	div.style.display = "inline-block";
}

function makeInvisible()
{
	para.innerHTML = "";
	div.clientWidth = 0
	div.clientHeight = 0
	div.style.display = "None";
}

$(document).ready(function(){
	start();
});

