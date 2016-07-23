var popupID = "hoverWikiBox";
var paragraphID = "textPara";
var popupWidth = 400;
div = null;
para = null;
img = null;
articleNotFoundText = "Sorry, we couldn't find that article."

function start()
{
	console.log("Content script running");
	$('[title]').removeAttr('title');
	addDiv();
	addMouseOverEvent();
}

function addMouseOverEvent()
{
	console.log("adding events");
	$('a').hover(function(e){
		var x = e.clientX;
		var y = e.clientY;
		var link = $(this).attr("href");
		var article = link.split("/").pop();
		setPosition(x,y);
		getPreview(article);
	}, function(){
		makeInvisible();
	});

	// $('a').mouseleave(function(e){
	// 	makeInvisible();
	// });
}

function getPreview(article, x, y)
{
	console.log(article);

	// var url = "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&redirects&page=" + article;

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

	           	setText(text);
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
	img.style.display = "None";

	var node = document.createTextNode(text);
	para.innerHTML = "";
	div.style.width = popupWidth + "px";
	para.appendChild(node);
}

function setPosition(x,y)
{
	img.style.display = "inline-block";

	pageY = window.pageYOffset;
	pageX = window.pageXOffset;

	pageWidth = document.body.clientWidth;
	pageHeight = document.body.clientHeight;

	divHeight = div.clientHeight;

	x += pageX;
	y += pageY;

	if(x + popupWidth > pageWidth)
		x += -1*popupWidth;

	if(y + divHeight > pageHeight)
		y -= divHeight;

	div.style.left = x+"px";
	div.style.top = y+"px";

	//div.style.backgroundImage = chrome.extension.getURL("./ajax-loader.gif");

	makeVisible()
}

function addDiv()
{
	console.log("Adding Div.");
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
	else
	{
		console.log("condition not met");
	}
}

function makeVisible()
{
	div.style.display = "inline-block";
}

function makeInvisible()
{
	para.innerHTML = "";
	//div.style.width = "auto";
	div.style.display = "None";
}

$(document).ready(function(){
	start();
});

