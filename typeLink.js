//TODO array instead of |
window.onload = function() {
	String.prototype.startsWith = function(str) {
		return (this.match("^" + str) == str)
	}
	Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
	}

	var labelVisible=false;
	var search = null;
	var suggestedWord = null;
	var suggestedWordId = null;
	var typeField = document.body;
	var lastWordChecked = "";
	var timer;
	var CLEAR_TIMEOUT = 2000;
	var words = new Array();
	var wordsDescr = new Array();
	var wordsLink = new Array();
	var wordsFunct = new Array();
	var wordsDiv = new Array();
	var ignoreFocus = new Array("text","select-one");

	function addLabelElement(){
	     var divTag = document.createElement("div");  
	     divTag.id = "typeLinkLabelBk"; 
	     divTag.setAttribute("align", "center"); 
	     divTag.className = "typeLinkBk"; 	     	     
	     document.body.appendChild(divTag); 

	     var divTag2 = document.createElement("div");  
	     divTag2.id = "typeLinkLabel"; 
	     divTag2.setAttribute("align", "center"); 
	     divTag2.className = "typeLinkHint"; 	     
	     divTag.appendChild(divTag2); 

 	}

	addLabelElement();
	getWordsFromElements();
	invalidate();
  	
 	
	//if has focus get keypresses
	typeField.onkeypress = function(e) {
		var allowInvalidate=true;
		// ignore elements
		if (ignoreFocus.contains(document.activeElement.type)){            	
            	return;
        	}		
		e = e || window.event;
		var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		if (e.keyCode == 46) {
			clearSearch();
			return;
		}
		if (charCode > 0 && !ignore(e.which)) {
			switch (e.which) {
				//backspace
			case 8:
				deleteLastChar();
				break;
				//enter
			case 13:
				submit();				
				break;

			default:
				if (search == null) {
					search = "";
				}
				search += String.fromCharCode(charCode).toLowerCase();
			}

			//Clear the search
			if (timer != null) {
				clearTimeout(timer);
			}
			timer = setTimeout(function() {
				clearSearch.call()
			}, CLEAR_TIMEOUT);			
			invalidate();
		}
	};

	function getWordsFromElements() {
		var divs = document.getElementsByClassName('typelink');
		for (var i = 0; i < divs.length; i++) {
			var hint = divs[i].dataset.hint + "";
			if (hint == "undefined") {

				if (divs[i].innerHTML.length <= 1) {
					continue;
				} else {
					hint = divs[i].innerHTML + "";
				}
			}

			var hints = hint.split("|");
			for (var j = 0; j < hints.length; j++) {
				wordsDescr.push(divs[i].innerHTML);
				words.push(hints[j].toLowerCase());
				wordsLink.push(divs[i].href)
				wordsFunct.push(divs[i].getAttribute('onclick'));
				wordsDiv.push(divs[i]);
			};
		}
	}

	//chars to ignore

	function ignore(code) {	
		return false;		
	}

	function deleteLastChar() {
		if (search != null) {
			var strLen = search.length;
			search = search.slice(0, strLen - 1);
			if (search.length == 0) {				
				clearSearch();
			}
		}

	}

	function clearSearch() {
		search = null;
		suggestedWord = null;
		suggestedWord = -1;
		invalidate();
		hideLabel();
	}

	function submit() {		
		labelConfirmed();
		if (suggestedWordId == -1) return;
		search = null;
		if (suggestedWord != null) {
			clearSearch();
			var link = wordsLink[suggestedWordId];
			var mfunction = wordsFunct[suggestedWordId];

			//if input focus
			var type = wordsDiv[suggestedWordId].type;			
        	if (type=="text" ){
            	wordsDiv[suggestedWordId].focus();
        	}
			if (link != null && link.length > 1) {
				window.location = link;
			}
			if (mfunction != null && mfunction.length > 1) {
				eval(mfunction)();
			}
		}
		
	}

	function startOver() {
		if(search==null){
			return;
		}
		var strLen = search.length;
		search = search.slice(strLen - 1, strLen);				
	}

	function invalidate() {		
		if (search == null) {			
			return;
		}
		if (!isInWords()) {	
			hideLabel();		
			startOver();
			if (!isInWords()) {	
				hideLabel();
			}else{
				showLabel();
			}
		}else{
			showLabel();
		}

	}

	function isInWords() {
		var found = false;
		var exactMatch=false;
		var id = 0;
		words.forEach(function(item) {
			if (item == search) {
				exactMatch = true;
			} else if (item.startsWith(search) && search != null) {
				found = true;
				suggestedWord = item;
				suggestedWordId = id;	

				if (wordsDescr[suggestedWordId].length > 2 && suggestedWord.toLowerCase() != wordsDescr[suggestedWordId].toLowerCase()) {					
					document.getElementById("typeLinkLabel").innerHTML = '<b>' + item.slice(0, search.length) + '</b>' + item.slice(search.length, item.length) + ' (' + wordsDescr[suggestedWordId] + ')';
				} else {					
					document.getElementById("typeLinkLabel").innerHTML = '<b>' + item.slice(0, search.length) + '</b>' + item.slice(search.length, item.length);
				}
			}
			id++;
		});
		if(exactMatch){
			submit();
			return false;
		}
		else if (found) {
			return true;
		} else {
			return false;
		}
	}

	
	function hideLabel(){
		labelVisible=false;
		document.getElementById("typeLinkLabel").style.visibility = "hidden"; //to hide it		
		document.getElementById("typeLinkLabelBk").style.visibility = "hidden"; //to hide it		
	}
	function showLabel(){
		labelVisible=true;		
		document.getElementById("typeLinkLabel").style.visibility = "visible"; //to show it
		document.getElementById("typeLinkLabelBk").style.visibility = "visible"; //to show it

	}
	function labelConfirmed(){
		hideLabel();
	}

	//The css
	// var str= ".typeLinkHint{background-color: #474747;	opacity: 1.8;position:fixed;	text-overflow:ellipsis;	overflow: hidden;	width:20%;	left: 40%;	padding: 15px;	margin-left:auto;	margin-right:auto;	top:0;		visibility: hidden;	background: #222;	font-size: 200px;	color: #222;	text-shadow: 0px 2px 3px #666;	-webkit-box-shadow: 0px 2px 3px #555;	-moz-box-shadow: 0px 2px 3px #555;	-webkit-border-radius: 4px;border-radius: 4px;	-moz-border-radius: 4px;";
	var str= "#typeLinkLabel{position:fixed;	text-overflow:ellipsis;	overflow: hidden;	width:20%;	left: 40%;	padding: 15px;	top:0;		visibility: hidden;	font-size: 20px;	color: #222;	text-shadow: 0px 1px 1px #666;font-family: 'Arial';}";
	str+=" #typeLinkLabelBk{position:fixed; background-color: #474747;opacity: 0.94; height:30px; width:20%;	left: 40%;	padding: 14px;	top:0; visibility: hidden;	overflow: auto;-webkit-box-shadow: 0px 2px 3px #555;	-moz-box-shadow: 0px 2px 3px #555;	-webkit-border-radius: 4px;border-radius: 4px;	-moz-border-radius: 4px;}";
	var pa= document.getElementsByTagName('head')[0] ;
	var el= document.createElement('style');
	el.type= 'text/css';
	el.media= 'screen';
	if(el.styleSheet) el.styleSheet.cssText= str;// IE method
	else el.appendChild(document.createTextNode(str));// others
	pa.appendChild(el);
}


