
// Use ECMAScript strict mode
// noinspection EqualityComparisonWithCoercionJS

"use strict";

// Tell UploadCare to start only when needed
var UPLOADCARE_MANUAL_START = true;

// Main global variable
var narra = {
    // ID of the subject of the narrative
    subjectID: $('meta[name=subjectID]').attr("content"),
	
	// id of narration postgres table (to attach at tables of each narration
	id_n: null,
	
    
    // Current mouse positions
    currentMousePos: {x: -1, y: -1},
    
    // Main language
    currentLang: "en",
    
    // Alternative language (inactive)
    otherLang: "it",
    
    // Contains suggestions for autocomplete
    suggestions: {},
    
    // Contains all events of the narrative
    events: {},

	// Contains the type of event (map, sketchfab or slide)
	formType: '',
    
    // Contains the slides of the visualization timeline
    slides: {},
    
    // Contains all images
    images: {},
    
    // Contains all Wikidata entities (item = entity)
    items: {},
    
    // Contains authors of primary/secondary sources
    authorMap: {},
    
    // Contains primary/secondary sources
    sourceMap: {},
    
    // Contains authors in array form
    authorArray: [],
    
    // Contains sources in array form
    sourceArray: [],
    
    // Contains event types (e.g. Birth, Creation...)
    eventTypes: {},
        
    // Contains roles that people can play in an event
    roles: {},
    
    // Contains relations among events
    rels: {},
    
    // Contains BibTex bibliography (inactive)
    bib: {},
    
    // Counter for SPARQL query pagination
    counter: 0,

    // Remote database
    remote: null,
    
    // Local database (inactive)
    db: null,
    
    // Synchronization database (inactive)
    sync: null,
    
    // Database name (taken from narrative subject ID)
    dbName: null,
    
    // Narrative metadata
    info: {},
    
    // Name of the current user (for creating table in db: for simple users it's the same of userNameToDisplay; for VRE users it's different)
    user: "",
	
    // Name of the current user (for displaying in menu)
    userNameToDisplay: "",

    // Wikidata classes mapped to our defaults
    mainClasses: [
        "234460",    // Work (text)
        "14204246",  // Page (hidden)
        "11471",     // Time (hidden)
        "1190554",   // Event (hidden)
        "8436",      // Person (family)
        "5",         // Person
        "15222213",  // Object (artificial physical)
        "17334923",  // Place
        "43229",     // Organization
        "386724",    // Work
        "7184903",   // Concept (abstract object)
        "4026292",   // Concept (action)
        "488383"     // Object
    ]
	
};

// Declaring global variables
// Switch form based on user choice
let formType = "map";

// Manage image sections
let countImageGroup = 1;

// Handle entities search filter
let entityClass = '';

// Handle the type of coordinates mainly for popovers
let coorType = '';


// calculate a position of a new events based on timeline events length 
function nextEventPosition() {
	return parseInt($("#timeline .timelineEvent").length) + 1;
}

// create HTML select for switch position of an event
function createHTMLSelect(){
	
	// order events by positions and make list
	var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
	}
	var eventsList = Object.keys(narra.events).sort(sort_by_position);

	var positionEvent = $('#positionEvent');

	// empty last select and append first blank line
	positionEvent.empty().append('<option value="empty" ></option>');

	// empty radio buttons
	$("#positionBefore").prop('checked', false);
	$("#positionAfter").prop('checked', false);

	// append titles of events <option> ordered by position
	for (var i= 0; i < eventsList.length; i++) {
		
		positionEvent.append('<option class="optionSel" id="optionSel' + narra.events[eventsList[i]]._id + '" value="' + narra.events[eventsList[i]]._id + '">' + narra.events[eventsList[i]].title + "</option>");
	
	}
	
	// uncheck radio button for "after/before" append
	$('.radioPositionButton').prop('checked', false);
	
}

// switch a new event or a modified event after or before another event
function switchPositionEvent(afterBefore, eventToSwitch, evid){
	
	// order events by positions and make list
	var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
	}
	var eventsList = Object.keys(narra.events).sort(sort_by_position);
	
	// get position of event with which I want to switch my new or modified event
	var position;
	if (eventToSwitch in narra.events) {
		position = parseInt(narra.events[eventToSwitch].position);
	} else {
		position = narra.events[evid].position;
	}
	
	var toSwitch;
	var i;
	if (afterBefore == "before") {
		toSwitch = false;
		for (i=0; i < eventsList.length; i++) {
			
			if (eventsList[i] == eventToSwitch) {
				toSwitch = true;
			}
			
			if (toSwitch) {
				
				// change position in object and in #timeline event div of the events after my event + 1
				narra.events[eventsList[i]].position = parseInt(narra.events[eventsList[i]].position) + 1;
				$('#timeline #' + narra.events[eventsList[i]]._id).attr('position', parseInt(narra.events[eventsList[i]].position));
				
				console.log("è stato cambiato " + narra.events[eventsList[i]].title);

			}
		
		
		}
	} else if (afterBefore == "after") {
		
		toSwitch = false;
		for (i=eventsList.length -1; i > -1; i--) {
			
			if (eventsList[i] == eventToSwitch) {
				toSwitch = true;
			}
			
			if (toSwitch) {
			
				// change position in object and in #timeline event div of the events before my event -1
				narra.events[eventsList[i]].position = parseInt(narra.events[eventsList[i]].position) - 1;
				$('#timeline #' + narra.events[eventsList[i]]._id).attr('position', parseInt(narra.events[eventsList[i]].position));
				
				console.log("è stato cambiato " + narra.events[eventsList[i]].title);
			
			}
		
		}
	
	}

	return position;
	
}

// fix order position of events after a switch/delete of an event
function fixPositionAfterSwitch(){
	
	// order events by positions and make list
	var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
	}
	
	var eventsList = Object.keys(narra.events).sort(sort_by_position);
	
	// change position in object and in #timeline event div based on timeline length (from 1 to last number of timeline)
	for(var i=0; i < eventsList.length; i++){
		
		narra.events[eventsList[i]].position = i + 1;
		$('#timeline #' + narra.events[eventsList[i]]._id).attr('position', parseInt(narra.events[eventsList[i]].position));
	
		saveObjectToDB(narra.events, narra.events[eventsList[i]]._id);
	
	}

}

// Check if workspace is empty before exiting the tool
window.onbeforeunload = function() {
    if (!workspaceIsEmpty()) {
        return true;
    }
    return null;
};

// On window load...
window.onload = function () {
    // Check database name (Wikidata ID)
	
	const params = new URLSearchParams(window.location.search);
	narra.subjectID = params.get('idwiki');
	narra.dbName = narra.subjectID.toLowerCase();
	
	// if is null, narration is new. else is already in db
	narra.id_n = params.get('idnar');
	
    
    $('body').on('focus', '[contenteditable]', function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur keyup paste input', '[contenteditable]', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    });


    // Track mouse movements for dragging
	$(document).on("mousemove", function (event) {
        narra.currentMousePos.x = event.pageX;
        narra.currentMousePos.y = event.pageY;
    });
    
    // Make :contains case-insensitive in jQuery
    $.expr[":"].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) > -1;
        };
    });
    
    // Load event types from JSON file
    $.getJSON("../json/newtypes.json", function (data) {
        console.log(currentTime() + "Loaded event types");
        narra.eventTypes = data.types;
    });
    
    // Start loading CouchDB database
    initTest(narra.dbName);
    
    $(document).ready(function() {

		var lastEntityClass;
		// Hide other entity classes when a class is selected
		$('.toggle-btn-entities').on("click", function() {
			if (typeof lastEntityClass == 'undefined') {
				lastEntityClass = 'all';
			}
			var dataClassValue = $(this).attr('data-class');
			var dataContainer = $('#data-container');
			entityClass = $(this).attr('data-class');
			if ((lastEntityClass.length > 0) && (lastEntityClass != dataClassValue) && !($(this).hasClass("add-button-active-entities"))) {
				dataContainer.css("display", "block");
				$('#entities-not-selected').css("display", "none");
			}
			else if (dataContainer.css("display") == "block") {
				dataContainer.css("display", "none");
				var children = dataContainer.children();
				var hasChild = false;
				for (var i = 0; i < children.length; i++) {
					var child = $(children[i]);
					if (child.css("display") == "block") {
					  hasChild = true;
					}
				}
				if (!hasChild) {
					$('#entities-not-selected').css("display", "block");
				}
			} else if (dataContainer.css("display") == "none") {
				dataContainer.css("display", "block");
				$('#entities-not-selected').css("display", "none");
			}
			lastEntityClass = $(this).attr('data-class');
			$(this).siblings().removeClass('add-button-active-entities');
			$(this).toggleClass('add-button-active-entities');
		});

        $("#auth-form").bind("submit", function (event) {
            event.preventDefault();
            authenticate($("#inputName").val(), $("#inputPassword").val(), narra.dbName);
        });

		var dropdownClass = $('.dropdown');

        // Add slideDown animation to Bootstrap dropdown when expanding.
        dropdownClass.on('show.bs.dropdown', function() {
            $(this).find('.dropdown-menu').first().stop(true, true).slideDown("fast");
        });

        // Add slideUp animation to Bootstrap dropdown when collapsing.
        dropdownClass.on('hide.bs.dropdown', function() {
            $(this).find('.dropdown-menu').first().stop(true, true).slideUp("fast");
        });
        
        // Set click event on home button
        $("#home").click(function() {
            $('.popover').hide();
            if ($(this).text() === "LOGOUT") {
                confirmLogout();
            } else if ($(this).text() === "BACK") {
                restoreInitialView();
            } else {
                confirmHome();
            }
        });

		$(".radioVideoBtn").each(function (){
			addRadioListener($(this));
		});

		$(".radioCoorsBtn").each(function (){
			addCoorsListener($(this));
		});

		$(".backImgInput").each(function (){
			addBackgroundImageListener($(this));
		});

		$(".eventImageInput").each(function (){
			addImageListener($(this));
		});

		$('[data-toggle="tooltip"]').tooltip({
			animated: 'fade',
			placement: 'auto',
			trigger: 'manual'
		}).on('click', function() {
			// if the tooltip is visible, hide it, otherwise, show it
			if ($(this).attr('aria-describedby')) {
				$(this).tooltip('hide');
			} else {
				$(this).tooltip('show');
			}
		});

		// close the tooltip when click is outside of it
		$(document).on('click', function (e) {
			$('[data-toggle="tooltip"]').each(function () {
				// check if click is inside the tooltip
				if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
					$(this).tooltip('hide');
				}
			});
		});

		// show popover on click on "New Entity" button
		$("#plusButton").on("click", function(event) {
			event.cancelBubble = true;
			if (event.stopPropagation) {
				event.stopPropagation();
			}
			$('#plusButton').popover('show');
		});
        
        // Set keypress keydown event on auth elements
        $("#auth-div input").on("keypress keydown", function() {
            $(this).parents("#auth-div").removeClass("has-error");
            $("#auth-div .help-inline").text("");
        });
        
        // Set keypress keydown event on form elements
        $(".form-control").on("keypress keydown", function() {
            $(this).parents(".form-group, .form-inline, .input-group, .twitter-typeahead").removeClass("has-error");
        });

		// Set keypress keydown event on video URL input
        $("#eventVideo").on("keypress keydown", function() {
            $(this).removeClass("has-error");
        });

		// Set change event on video URL input
        $("input[type=radio][name=media_type]").change(function() {
            $("#eventVideo").parent('.video-label-group').removeClass("has-error");
        });

		// Set keypress keydown event on Start date
        $("#dateInputStart").on("keypress keydown", function() {
            $(this).removeClass("has-error-date");
        });

		// Set keypress keydown event on End date
        $("#dateInputEnd").on("keypress keydown", function() {
            $(this).removeClass("has-error-date");
        });

		// Set change event on coordinates radio buttons
		$("input[type=radio][name=coors-type]").change(function() {
			$(".radioCoorsLabel").removeClass("has-error-coors");
		});

		// Set keypress keydown event on latitude and longitude coordinates
		$("#latitud").on("keypress keydown", function() {
			$("#latitud").removeClass("has-error-coors");
		});
		$("#longitud").on("keypress keydown", function() {
			$("#longitud").removeClass("has-error-coors");
		});

		// Set keypress keydown event on polygon coordinates
		$("#polygonArea").on("keypress keydown", function() {
			$("#polygonArea").removeClass("has-error-coors");
		});

		// Set keypress keydown event on sketchfab ID
		$("#id-text").on("keypress keydown", function() {
			$("#id-text").removeClass("has-error-sketch");
		});

		// Set keypress keydown event on sketchfab annotation
		$("#number-text").on("keypress keydown", function() {
			$("#number-text").removeClass("has-error-sketch");
		});
        
        // Set keypress keydown event on digital object input
        $('#digobjInput').on("keypress keydown", function (e) {
          if (e.which == 13) {
            addDigitalObject($('#digobjInput').val().trim(), $('#digobjTitle').val());
            return false;
          }
        });
        
        $('#exportButton').click(function() {

			for (var key in narra.events) {
				var fragment = "";
				var source = "";
				var secondaryAppend = "";
				var primaryAppend = "";
				var entitiesList = [];

				narra.events[key].text = {
					'headline': narra.events[key].title,
					'text': narra.events[key].description ? narra.events[key].description : ""
				};

				narra.events[key].location = {

					"name": "",
					"lat": parseFloat(narra.events[key].latitud),
					"lon": parseFloat(narra.events[key].longitud),
					"zoom": 10,
					"line": true

				};

				// Function to link to English or Italian Wikipedia
				function createLinkWithTooltip(qid, lang) {

					var linkIri;

					if(qid.startsWith("Q")){
							linkIri= "https://www.wikidata.org/wiki/" + narra.items[qid]['_id'];
					} else {
						linkIri = "https://tool.dlnarratives.eu/CustomEntity/?idU="+qid+"&user="+narra.user+"&idN="+narra.id_n+"&subject="+narra.subjectID;
					}

					return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' target='_blank' href='"+linkIri+"'>" + narra.items[qid][lang + 'Name'] + "</a>"
				}

				// Get list of entities and link to Wikipedia
				for (var qid in narra.events[key].props) {
					var prop = narra.events[key].props[qid];
					if (qid !== undefined && qid in narra.items) {
						//en entities
						if(narra.currentLang == "en"){
							if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							} else if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							}
						// it entities
						} else {
							if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							} else if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							}
						}
					}

					// Handle event images (or other media)
					if (prop !== undefined) {

						// load media of event if any
						if(narra.events[key].eventMedia != ""){

							narra.events[key].media = {'url' : narra.events[key].eventMedia, 'caption' : narra.events[key].eventMediaCaption}

						}

						var j;

						// Handle secondary sources of events
						if ('secondary' in prop && prop.secondary.length > 0) {
							for (j = 0; j < prop.secondary.length; j++) {
								if (!narra.events[key].text.text && prop.secondary[j].text) {
									narra.events[key].text.text = prop.secondary[j].text;
								}
								if (prop.secondary[j].title) {
									source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
									if (prop.secondary[j].reference != "") {
										source += ", " + prop.secondary[j].reference;
									}
									source += '\</li>';
									if (secondaryAppend.indexOf(source) < 0) {
										secondaryAppend += source;
									}
								}
							}
						}

						// Handle primary sources of events
						if ('primary' in prop && prop.primary.length > 0) {
							for (j = 0; j < prop.primary.length; j++) {
								if (prop.primary[j].title) {
									source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
									if (prop.primary[j].reference != "") {
										source += ", " + prop.primary[j].reference;
									}
									source += '\</li>';
									if (primaryAppend.indexOf(source) < 0) {
										primaryAppend += source;
									}
								}
							}
						}
					}
					if (fragment.length > 0) break;
				}

				// Set event text
				narra.events[key].text.text += fragment;
				var textToAppend = "";

				// Function to make a list of digital objects
				function makeDigObjList(urls) {
					var results = [];
					var l;
					var a;

					//if digital objets is array of objects (url + title))
					if (urls && $.type(urls) === "array" && $.type(urls[0]) === "object") {

						for(l=0; l < urls.length; l++){
							a = document.createElement("a");
							a.setAttribute("href", urls[l].url);
							a.setAttribute("target", "_blank");
							a.text = urls[l].title;
							results.push(a.outerHTML);
						}
					//if digital objets are old djobj (only array of urls)
					} else if (urls && $.type(urls) === "array") {
						for (l = 0; l < urls.length; l++) {
							a = document.createElement("a");
							a.setAttribute("href", urls[l]);
							a.setAttribute("target", "_blank");
							a.text = l + 1;
							results.push(a.outerHTML);
						}
					} else if (urls && $.type(urls) === "string") {
						a = document.createElement("a");
						a.setAttribute("href", urls);
						a.setAttribute("target", "_blank");
						a.text = "1";
						results.push(a.outerHTML);
					}
					return results.join(" • ");
				}

				// Display digital object list
				var digObjList = makeDigObjList(narra.events[key].objurl);

				// Append secondary sources to HTML
				if (secondaryAppend)
					textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

				// Append primary sources to HTML
				if (primaryAppend) {
					textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';
				}

				// Append list of entities to HTML
				if (entitiesList) {
					textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
				}

				// Append list of digital objects to HTML
				if (digObjList) {
					textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
						+ digObjList + '</span>';
				}

				// Set final event text
				if (textToAppend) {
					narra.events[key].text.text += textToAppend;
				}

				var a;

				//////////////////////////////////////////////
				if(narra.events[key].type.includes(',')){
					a = narra.events[key].type.split(",");
					narra.events[key].sketchfabid= a[0];
					narra.events[key].annotationNumber3DModel= a[1];
				} else if(narra.events[key].type.includes('*')){
					a = narra.events[key].type.split("*");
					narra.events[key].backgroundImg= a[0];
					narra.events[key].slidePosition= a[1];
				} else if(narra.events[key].type.includes('+')){
					a = narra.events[key].type.split("+");
					narra.events[key].eventMediaWidth= a[0];

				}

			}


            var data = {
                "A1": narra.info,
                "events": narra.events,
                "items": narra.items
            };
            download(
                JSON.stringify(data),
				"slide.json"
            );
        });
        
        // Set click event on digital object button
        $('#digObjButton').click(function () {
            addDigitalObject($('#digobjInput').val().trim(), $('#digobjTitle').val());
            return false;
        });
		
		//set inout to search event bar
		// When the text in the input changes
		$("#eventSearch").on("input", function() {
			// Retrieve input text
			var searchText = $(this).val().toLowerCase();

			// Retrieve all divs with class "contents" in div "container"
			$(".timelineEvent").each(function() {
				// Retrieves the title of the current div
				var title= $(this).find("span").text().toLowerCase();

				// Show the div if its title contains the input text, otherwise hide it
				if (title.indexOf(searchText) !== -1) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		});

        // Textarea height fit with content when user inserts an input
        $('textarea:not(#polygonArea)').on('input', function() {
            this.style.height = '';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Initialize autocomplete for Wikidata entities
        narra.suggestions = new Bloodhound({
          datumTokenizer: function(results) {
            return Bloodhound.tokenizers.whitespace(results);
          },
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          remote: {
			  url: 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=%QUERY&language=en&limit=20&format=json&callback=?',
			  wildcard: '%QUERY',
			  filter: function(response) {
				  var results = [];
				  response.search.forEach(function (qid, ignore) {
                    if (qid.description !== undefined && qid.description.indexOf('disambiguation') > 0) {}
                    else {
                        results.push(qid);
                    }
                });
                  return results;
                }
              }
        });
        narra.suggestions.initialize();
    });
};

function initTest(dbName) {
	
	$.ajax({
		type: "GET",
		url: "PHP//session.php", 
		dataType: "JSON",					
		data: {},
		success: function(resp) {
			console.log(resp.username);
			
				if(resp.username != ""){
					
					// assign user to display in narra object
					narra.userNameToDisplay= resp.usernameToDisplayInMenu;
				
					console.log(currentTime() + "Username is: " + resp.usernameToDisplayInMenu + "\"");

					var userName = $("#userName");
					
					userName.text(resp.usernameToDisplayInMenu.toUpperCase()).show();
					$("#home").show();
					$("#userMenu").show();
					
					$('#userMenu').css({ 'right' : userName.width() + 10 });
					$('.dropdown-menu-right')
						.css({ 'right' : userName.width() + 10 })
						.css({ 'top' : userName.height() +10});
						
					// if username(strg for bild tables) and usernameToDisplayInMenu (strg to display in user interface) are different, is a vre user. So HIDE Logout button
					if( resp.username != resp.usernameToDisplayInMenu){

						$("#account-menu").hide();
					
					}	

					// init DB with username (NOT usernameToDisplayInMenu) + subject narrative (dbName)
					var userString = resp.username + "-";
					console.log(resp.jsonData.length);
					for (var i=0; i<resp.jsonData.length;i++) {
						if(resp.jsonData[i][0]==narra.id_n && resp.jsonData[i][3]!=null){
							userString = resp.jsonData[i][3] + "-";
							console.log(resp.jsonData[i][3]);
						}
					} 
					
					initDB(userString + dbName, narra.id_n);
					
				} else {

					// if came from VRE (dlnarratives.moving.d4science.org)
					if (window.location.hostname == "dlnarratives.moving.d4science.org") {
						window.location.href = "https://moving.d4science.org/group/moving_storymaps";
					
					// if came from our login (tool.dlnarratives.eu)
					} else {
						window.location.href = "index.html";
						
					}
					
				}
				
		},
		error: function(response){
				var a= JSON.stringify(response);
				console.log(a);
			}
		
	});
}

//dbName is userName-idWikidata; idNarration is id of narration. It will create in php for new narrations, it passed in query string for existing narrations
function initDB(dbName, idNarration) {
    console.log(currentTime() + "Database name is: " + dbName);
	
	$.ajax({
		type: "POST",
		url: "PHP//narra-jsGetNarration.php", 
		dataType: "JSON",					
		data: {dbN: dbName, idNarra: idNarration},
		success: function(resp) {
			
			if (resp.username != "") {
			
			//update the id of a narration (it was null if it was a new narration)
			narra.id_n= resp.idNarra;
			
			// change url with new id narration created in PHP (for new narration; else remains idnarra passed in the url)
			var queryParams = new URLSearchParams(window.location.search);
			queryParams.set("idnar", resp.idNarra);
			history.replaceState(null, null, "?"+queryParams.toString());

			
			console.log(currentTime() + "Logged in to remote database as: " + resp.username);
			console.log(currentTime() + "Narration as: " + dbName);
            
            $(".spinner").hide();

			// assign user (for table creation, NOT to display in menu) to narra object
			narra.user = dbName.split("-")[0];

            console.log(currentTime() + "Remote database is accessible");
			
			syncDB();
				
				for (var i = 0; i < resp.allDBName.length; i ++) {

					var classMenu;
					
					if(narra.id_n == resp.allDBName[i][0]){
						classMenu= "activeMenu";
					} else {
						classMenu= "";
					}
					
					$("#narratives-menu").append("<div class='narra-list-item "+classMenu+"' id='storyMenu"+i+"'><a href='tool.html?idwiki=" + resp.allDBName[i][2].toUpperCase() + "&idnar="+resp.allDBName[i][0]+"' class='data' target = '_blank'>" + resp.allDBName[i][1] + "</a><div class='deleteButton' id='"+resp.allDBName[i][0]+"-"+resp.allDBName[i][2]+"-"+resp.username+"-"+resp.allDBName[i][1]+"' onclick='deleteNarrative(this.id)'> <b class='x'>×</b></div></div>");
				
				}
				
				if (window.location.hostname == "dlnarratives.moving.d4science.org") {
					$("#narratives-menu").append('<a href="Search/"><li  class="dropdown-header">Search Other Narratives</li></a>');
				} else {
					$("#narratives-menu").append('<a href="Search/?dataset=narratives"><li  class="dropdown-header">Search Other Narratives</li></a>');
				}
			
			} else {
					
					window.location="../tool/";
					
			}
		
		},
		error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

		}
		
	});

}

// Function for autocomplete
var substringMatcher = function(strs, lang) {
  return function findMatches(q, cb) {
      
    var matches = [];
    var substrRegex = new RegExp(q, 'i');

    $.each(strs, function(i, str) {
      if (substrRegex.test(str[lang])) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

// Keep local and remote databases synchronized (currently off)
function syncDB() {
    startQueries();
}

// Load list of narratives and show it in user menu
function showUserMenu() {
    narra.remote.getUser(narra.user, function (err, response) {
      if (err) {
        if (err.name === 'not_found') {
            console.log(currentTime() + "User database not found");
        } else {
            console.log(currentTime() + "Error with user database: " + err.name);
        }
      } else { console.log(response);
          $("#narratives-menu .narra-list-item").remove();
          for (var narraID in response.narratives) {
              var narrative = response.narratives[narraID];
                $("#narratives-menu").append("<li class='narra-list-item'><a href='tool.html?" + narrative.qid + "' class='data' style='background-color: " + getColor(narrative.type) + "' target = '_blank'>" + narrative.name + "</a></li>");
          }
      }
    });
}

// Return current time
function currentTime() {
    var d = new Date();
    return d.toISOString().split("T")[1].replace("Z", "") + " -- ";
}

// Return item type from array of Wikidata classes
function typeFromArray(array) {
        
    if (array.indexOf("other") > -1) {
        return "other";
    }
    if (array.indexOf("Q15474042") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q4167836") > -1) {
        return "hidden";
    }
	if (array.indexOf("Q27096213") > -1) {
        return "place";
    }  
    if (array.indexOf("Q5") > -1 || array.indexOf("Q8436") > -1) {
        return "person";
    }
    if (array.indexOf("Q234460") > -1) {
        return "work";
    }
    if (array.indexOf("Q41176") > -1) {
        return "object";
    }
    if (array.indexOf("Q17334923") > -1) {
        return "place";
    }
    if (array.indexOf("Q8205328") > -1) {
        return "object";
    }
    if (array.indexOf("Q43229") > -1) {
        return "organization";
    }
    if (array.indexOf("Q386724") > -1) {
        return "work";
    }
    if (array.indexOf("Q1190554") > -1) {
        return "other";
    }
    if (array.indexOf("Q186081") > -1) {
        return "hidden";
    }
    if (array.indexOf("Q7184903") > -1 || array.indexOf("Q4026292") > -1 || array.indexOf("Q5127848")) {
        return "concept";
    }
    if (array.indexOf("Q488383") > -1) {
        return "object";
    }
    if (array.indexOf("Q15222213") > -1) {
        return "object";
    }
    return "hidden";
}

// Sort elements based on their data-class attribute
function sortByClassFaster(a, b) {
    if (a.getAttribute("data-id") === narra.subjectID) {
        return -1;
    }
    if (b.getAttribute("data-id") === narra.subjectID) {
        return 1;
    }
    var classes = ["person", "organization", "object", "concept", "place", "work"];
    var compare = classes.indexOf(a.getAttribute("data-class")).toString().localeCompare(classes.indexOf(b.getAttribute("data-class")).toString());

    if (compare === 0) {
        return a.textContent.localeCompare(b.textContent);
    } else {
        return compare;
    }
}

// Sort elements based on their data-class attribute
function sortByClass(a, b) {
    if ($(a).attr("data-id") === narra.subjectID) {
        return -1;
    }
    if ($(b).attr("data-id") === narra.subjectID) {
        return 1;
    }
    var classes = ["person", "organization", "object", "concept", "place", "work"];
    var compare = classes.indexOf($(a).attr("data-class")).toString().localeCompare(classes.indexOf($(b).attr("data-class")).toString());

    if (compare === 0) {
        return $(a).text().localeCompare($(b).text());
    } else {
        return compare;
    }
}

// After login to DB, start queries
function startQueries() {
	var authDiv = $("#auth-div");
	authDiv.hide();
    console.log(currentTime() + 'Loading data from database');
	
	$.ajax({
		type: "POST",
		url: "PHP//startQueries.php",
		dataType: "JSON",
		data: {dbusername: narra.id_n + narra.user +'-'+narra.dbName},
		success: function(resp) {

			var i;

			// Load events from database
			for (i = 0; i < resp.events.length; i++) {
				narra.events[JSON.parse(resp.events[i])._id] = JSON.parse(resp.events[i]);
			}
			console.log(currentTime() + "load events from DB: " + narra.events);
			$("#container").css("display", "flex");
			$("#workspace").css("display", "none");
			$("#event-type").css("display", "flex");
			$("#exit-type").css("display", "none");
			$("#addButton,#saveButton,#cancelButton").toggleClass("disabledButton");
			$("#account-list").css("visibility", "visible");

			// Load entities from database
			for (i = 0; i < resp.entitys.length; i++) {
				narra.items[JSON.parse(resp.entitys[i])._id] = JSON.parse(resp.entitys[i]);
			}

			console.log(currentTime() + "load entity from DB: " + narra.items);

			if (narra.subjectID in narra.items && resp.entitys.length > 0) {
				makeEntities(narra.items, true);
				$(".spinner-loader").remove();
				finalLoad();
			}
			else {
				sparqlRequest([narra.subjectID], narra.counter + 1, undefined, undefined, true);
			}

			// Load narrative info from database
			if (resp.info != "") {

				narra.info = JSON.parse(resp.info);
				console.log(currentTime() + 'Load Narrative info (A1) From DB: ' + narra.info);

			} else {
				console.log(currentTime() + 'Narrative info not found in database; will create and save in DB');
				narra.info = {
					_id: "A1",
					id: narra.id_n,
					name: "",
					author: narra.user,
					idNarra: narra.id_n
				};
				saveObjectToDB({"A1": narra.info}, "A1");
			}

			// Load relations
			if (resp.relations != "") {
				narra.rels = JSON.parse(resp.relations).rels;
			}

			updateEventsCounter();
			createHTMLSelect();

		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);
		}
	});

    // Hide authorization window
    authDiv.hide();

}

function updateEventsCounter() {
    // Add eventCounter to events-counter
    var eventCounter = $('#timeline').children().length;
    $('#events-counter').text(eventCounter);
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function() {
            eventCounter = $('#timeline').children().length;
            $('#events-counter').text(eventCounter);
        });
    });
    var config_obs = {childList: true};
    var targetNode = document.getElementById('timeline');
    observer.observe(targetNode, config_obs);
}

// Perform final load: reset workspace and load default events
function finalLoad() {
    $(".spinner").hide();
    $("#auth-div").hide();
    resetWorkspace();
    console.log(currentTime() + "Reset workspace");
    addNewEntityPopoverTo($("#plusButton"));

    // if there are no events, load default ones
    if (narra.events === undefined || Object.keys(narra.events).length === 0) {
        defaultEvents();
        console.log(currentTime() + "Created default events");
    } else { // else, display events
        displayAllEvents();
        $("#timeline .timelineEvent").each(function (index, event) {
            $(event).delay(200 * index).fadeIn(200);
        });
        console.log(currentTime() + "Displayed events");
    }

    // Update title of narrative
    updateTitle();

}

// Download data (used for export)
function download(text, filename) {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    pom.setAttribute("download", filename);
    if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

// Truncate entity names
function truncate(string, len) {
    if (string.length > len) {
        return string.substring(0, len).trim() + "...";
    } else {
        return string;
    }
}

// Capitalize first word in a string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Capitalize all words in a string
function titlecase(str) {
    return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
}

// Get sources based on author name
function getSources(authorName) {
    var resultArray = [];
    var sources = narra.sourceMap[narra.authorMap[authorName]];
    if (sources) {
        $.each(sources, function (ignore, source) {
            resultArray.push(source.title);
        });
    }
    return resultArray;
}

// Get list of roles based on event type
function getRolesFromEventType(roles) {
    for (var i = 0; i < narra.eventTypes.length; i += 1) {
        if (narra.eventTypes[i][narra.currentLang] === $("#typeInput").val()) {
            itemsByLang($(narra.eventTypes[i].roles)).forEach(function(item) {
                if (roles.indexOf(item) === undefined) {
                    roles.push(item);
                }
            });
            break;
        }
    }
    return roles;
}

// Create element to select roles for people
function makeRoleSelect(entityID) {
	var evid = $("#workspace").attr("data-evid");
    var qids = getRoles(entityID);
    var currentRoles = [];
    var i;
    
    currentRoles = getRolesFromEventType(currentRoles);
    
    for (i = 0; i < narra.eventTypes.length; i += 1) {
        if (narra.eventTypes[i][narra.currentLang] === $("#typeInput").val()) {
            currentRoles = itemsByLang($(narra.eventTypes[i].roles)).sort();
            break;
        }
    }
    var participant = {"en": "participant", "it": "partecipante"};
    var other = {"en": "other", "it": "altro"};
    var roles = [];
    var $roleSelect = $("<select class='roleSelect' data-id='" + entityID + "'>").append(
		$("<option selected>").text(participant[narra.currentLang]))
        .change(
        function () {
            if ($(this).val() === "other") {
                $(this).hide();
                $(this).parent().find(".roleInput").removeClass("hidden");
            }
            else {
                $(this).show();
                $(this).parent().find(".roleInput").addClass("hidden");
            }
        }
    );
    if (qids !== undefined) {
        qids.forEach(function (qid, ignore) {
            var role = narra.roles[qid];
            if (role !== undefined) {

				var roleName;

                if (narra.currentLang == 'en' && role.enName !== undefined) {
                    roleName = truncate(role.enName, 32);
                    if (roles.indexOf(roleName) < 0) {
                        roles.push(roleName);
                    }
                }
                else if (narra.currentLang == 'it' && role.enName !== undefined) {
                    roleName = truncate(role.itName, 32);
                    if (roles.indexOf(roleName) < 0) {
                        roles.push(roleName);
                    }
                }
            }
        });
    }
    currentRoles.forEach(function (role, ignore) {
        roles.push(role);
    });
    Object.keys(roles.sort()).forEach(function (item, ignore) {
        $roleSelect.append(
            $("<option>").text(roles[item])
        );
    });
    $roleSelect.append(
        $("<option>").text(other[narra.currentLang])
    );
    if ($roleSelect.find("option").length === 0) {
        $roleSelect = $("<input>").addClass("roleSelect");
    }

	// fix role bug on entity popover
	if (evid in narra.events && entityID in narra.events[evid].props) {
		$roleSelect.append($("<option selected>").text(narra.events[evid].props[entityID].role));
	}
    return $roleSelect;
}

// Load BibTex file from disk
function loadBibFile(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		narra.bib = BibtexParser(contents);
		narra.bib._id = "B1";
		var bibList = {"B1": narra.bib};
		saveObjectToDB(bibList, "B1");
		$('.popover').each(function() {
			sourceComplete($(this))
		});
	};
	reader.readAsText(file);
}

// Toggle source details for compact visualization
function toggleSource(element) {
    $(element).parents(".sourceDiv").find(".upperMargin").toggle();
    if ($(element).find('.btn-arrow').text() === "▶") {
        $(element).find('.btn-arrow').text("▼");
    } else {
        $(element).find('.btn-arrow').text("▶");
    }
}

// Hide source details for compact visualization
function hideSource(element) {
    $(element).parents(".sourceDiv").find(".upperMargin").hide();
    $(element).find('.btn-arrow').text("▶");
}

function deleteSource(element) {
    showModal(
        "Delete Source",
        "Are you sure you want to delete this source?",
        "Keep Source",
        "Delete Source",
        function() {},
        function() {
            if ($(element).parents(".sourcesDiv").children().length > 1) {
                $(element).parents(".sourceDiv").remove();
            } else {
                $(element).parents(".sourceDiv").find("input").val("");
                $(element).parents(".sourceDiv").find("textarea").val("");
            }
        }
    );
}

// Bibliography autocomplete
var bibMatcher = function(strs) {
	return function findMatches(q, cb) {

		var matches = [];
		var substrRegex = new RegExp(q, 'i');

		$.each(strs, function(i, str) {
		  if (substrRegex.test(str.Fields.author)) {
			matches.push(str);
		  }
		});

		cb(matches);

	};
};

// Update autocomplete for bibliography
function sourceComplete($sourceBibDiv) {
    $sourceBibDiv.find(".bibInput").typeahead("destroy");
    $sourceBibDiv.find(".bibInput").typeahead(
        {
            minLength: 0,
            hint: false
        },
        {
            source: bibMatcher(narra.bib.entries),
            display: function(obj) {return obj.EntryKey},
            limit: 1000,
        }
    ).bind("typeahead:select", function (ignore, suggestion) {
        $(this).parents(".sourceDiv").find(".titleInput").val(suggestion.Fields.title);
        $(this).parents(".sourceDiv").find(".authorInput").val(suggestion.Fields.author);
    });
}

// Create popover div for source
function makeSourceDiv(heading, author, title, ref, text, coorType, qid, valueRadio=undefined) {
	var $sourceHead = $("<div class='popoverContent' id='popover-radio-div-" + qid + "'>" +
			"<h5 class='showEntity-title'>Visual filter on the map</h5>" +
			"<div class='form-group'>");
	// first check is for displaying the right buttons
	if (coorType == 'point') {
		// second one is for checking the right button
		if (valueRadio == 'isPoint') {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint' checked='checked'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"</div>"
			);
		} else if (valueRadio == 'isNothing') {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing' checked='checked'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5><div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors-lat' id='btn-copy-coors-lat" + qid + "' value='lat' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-lat" + qid + "' class='radioButtonText radioEntities'>Latitude</label></div>" +
				"<div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qid + "' value='long' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-long" + qid + "' class='radioButtonText radioEntities'>Longitude</label></div></div>" +
				"</div>"
			);
		} else {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5><div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors-lat' id='btn-copy-coors-lat" + qid + "' value='lat' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-lat" + qid + "' class='radioButtonText radioEntities'>Latitude</label></div>" +
				"<div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qid + "' value='long' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-long" + qid + "' class='radioButtonText radioEntities'>Longitude</label></div></div>" +
				"</div>"
			);
		}
	} else if (coorType == 'polygon') {
		if (valueRadio == 'isPolygon') {
			$sourceHead.append("<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol' checked='checked'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"</div>"
			);
		} else if (valueRadio == 'isNothing') {
			$sourceHead.append("<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing' checked='checked'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>" +
				"<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qid + "' value='pol' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-pol" + qid + "' class='radioButtonText radioEntities'>Polygon</label></div>" +
				"</div>"
			);
		} else {
			$sourceHead.append("<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>" +
				"<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qid + "' value='pol' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-pol" + qid + "' class='radioButtonText radioEntities'>Polygon</label></div>" +
				"</div>"
			);
		}
	} else if (coorType == 'both') {
		if (valueRadio == 'isPoint') {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint' checked='checked'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"</div>"
			);
		} else if (valueRadio == 'isPolygon') {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol' checked='checked'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"</div>"
			);
		} else if (valueRadio == 'isNothing') {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing' checked='checked'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5><div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors-lat' id='btn-copy-coors-lat" + qid + "' value='lat' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-lat" + qid + "' class='radioButtonText radioEntities'>Latitude</label></div>" +
				"<div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qid + "' value='long' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-long" + qid + "' class='radioButtonText radioEntities'>Longitude</label></div></div>" +
				"<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qid + "' value='pol' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-pol" + qid + "' class='radioButtonText radioEntities'>Polygon</label></div>" +
				"</div>"
			);
		} else {
			$sourceHead.append("<input type='radio' id='showEntityPoint" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPoint'/>" +
				"<label for='showEntityPoint" + qid + "' id='showEntityPointLabel" + qid + "' class='radioButtonText radioEntities'>Show point</label><br>" +
				"<input type='radio' id='showEntityPolygon" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showPol'/>" +
				"<label for='showEntityPolygon" + qid + "' id='showEntityPolygonLabel" + qid + "' class='radioButtonText radioEntities'>Show polygon</label><br>" +
				"<input type='radio' id='showEntityNothing" + qid + "' class='radioButtons' name='show-entity" + qid + "' value='showNothing'/>" +
				"<label for='showEntityNothing" + qid + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
				"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5><div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors-lat' id='btn-copy-coors-lat" + qid + "' value='lat' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-lat" + qid + "' class='radioButtonText radioEntities'>Latitude</label></div>" +
				"<div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qid + "' value='long' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-coors-long" + qid + "' class='radioButtonText radioEntities'>Longitude</label></div></div>" +
				"<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qid + "' value='pol' onclick='copyToClipboard(this.value, \"" + qid + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
				"<label for='btn-copy-pol" + qid + "' class='radioButtonText radioEntities'>Polygon</label></div>" +
				"</div>"

			);
		}
	} else {
		$sourceHead.append("<p class='no-coords-popover'>No coordinates found.</p>");
	}

    return $("<div class='popoverContent sourceDiv'>").append($sourceHead);
}

// Create popover for entities
function makePopoverContent(self, withForm, evid) {
    var qid = self.attr("data-id");
    var dataClass = self.attr("data-class");
    
    if (qid === undefined) {
        return "";
    }
        
    var role = "Role in the event: ";
    var frag = "• Reference: ";
    var textArea = "• Text: ";
    var src = "• Title: ";
    var auth = "• Author: ";
    var primary = "Show on map";
    var deleteLabel = "Delete Entity";
    var addImageLabel = "Add Image";
    var changeImageLabel = "Change Image";

    if (narra.currentLang === "it") {
        role = "Ruolo nell\"evento: ";
        frag = "• Riferimento: ";
        textArea = "• Testo: ";
        src = "• Titolo: ";
        auth = "• Autore: ";
        primary = "Mostra su mappa";
        deleteLabel = "Cancella entità";
        addImageLabel = "Aggiungi entità";
        changeImageLabel = "Cambia entità";
    }
    
    var $mainDiv = $("<div class= 'popoverContent ui-front'>")
    .attr("data-id", qid)
    .attr("onclick", "event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation();");
    
    var $deleteDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'><a class='pointer' onclick='event.stopPropagation(); deleteEntity(\"" + qid + "\");'>" + deleteLabel + "</a></div>"
    );

    var image = getImage(qid);
    
    var $addImageDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv imageLabelDiv'><a class='pointer' onclick='event.stopPropagation(); $(this).toggle(); $(this).parent().next().toggle(); $(this).parent().next().css(\"display\", \"inline-block\"); imageRequest(\"" + qid + "\", $(this));'>" +
        (image !== "" ? changeImageLabel : addImageLabel)
         + "</a></div>",
        "<div class='popoverDiv imageContentDiv' style='display: none;'>Loading...</div>"
    );
	
    var $imageDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'>" +
            (image !== "" ? "<img class='popoverImage' src='" + image.replace("http:", "https:").replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=') + "" + "' alt='Entity image' />" + "</div><hr>" : "<img class='popoverImage' src='' alt='Empty entity image' style='display:none'></div><hr class='popoverImageSeparator' style='display:none'>")
    );
    
    if (!withForm && qid[0] !== "Q") {
        return $mainDiv.append($imageDiv, $addImageDiv, $deleteDiv);
    }

    if (dataClass == "place") {
		// start coords check

		if (narra.items[qid].hasOwnProperty("coordinatesPolygon") && !narra.items[qid].hasOwnProperty("coordinatesPoint")) {
			coorType = 'polygon';
		} else if (narra.items[qid].hasOwnProperty("coordinatesPoint") && !narra.items[qid].hasOwnProperty("coordinatesPolygon")) {
			coorType = 'point';
		} else if (narra.items[qid].hasOwnProperty("coordinatesPolygon") && narra.items[qid].hasOwnProperty("coordinatesPoint")) {
			coorType = 'both';
		} else {
			coorType = '';
		}
		// end coords check

		// start showOnMap property check
		evid = $("#workspace").attr("data-evid");
		var valueRadio = '';

		if (evid !== undefined && evid in narra.events && qid in narra.events[evid].props && narra.events[evid].props[qid].hasOwnProperty('showOnMap')) {
			if (narra.events[evid].props[qid].showOnMap == 'showPoint') {
				valueRadio = 'isPoint';
			} else if (narra.events[evid].props[qid].showOnMap == 'showPol') {
				valueRadio = 'isPolygon';
			} else if (narra.events[evid].props[qid].showOnMap == 'showNothing') {
				valueRadio = 'isNothing';
			}
		}
		// end showOnMap property check

        var $primaryContainer = $("<div class='popoverContent sourcesDiv primaryContainer'>").append(makeSourceDiv(primary, auth, src, frag, textArea, coorType, qid, valueRadio));
    }

    var $wikiDiv = $("<div class='popoverContent popoverCenter lowerMargin'>").append(
        "<div class='popoverDiv'>" +
            "<a class='popoverLink' target='_blank' href='https://" + narra.currentLang + ".wikipedia.org/wiki/" + getLabel(qid).replace(" ", "_").replace(" ", "_").replace(" ", "_") + "'>" +
                "Wikipedia" +
            "</a>" +
            " • " +
            "<a class='popoverLink' target='_blank' href='https://wikidata.org/wiki/" + qid + "'>" +
                "Wikidata" +
            "</a>" +
        "</div>"
    );

    if (withForm && self.attr("data-class") === "person") {
        $mainDiv.append(
            "<div class='popoverContent'>" +
                    "<div class='popoverDiv'>" +
                    "<div class='popoverCell'>" +
                    "<label class='popoverLabel'>" + role + "</label>" +
                    "</div>" +
                    "<div class='popoverCell popoverCell-70'>" +
                    "<input type='text' class='roleInput hidden' autocomplete='off'>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
        );
        $mainDiv.find(".roleInput").before(
            makeRoleSelect(qid)
        );
    }

    if (withForm && narra.events[evid] !== undefined && narra.events[evid].props !== undefined && narra.events[evid].props[qid] !== undefined) {
        var prop = narra.events[evid].props[qid];
        if (prop.role !== undefined) {
            $mainDiv.find(".roleSelect").val(prop.role);
        }
        if (prop.notes !== undefined) {
            $mainDiv.find(".event-source").val(prop.notes);
        }

        if (prop.primary !== undefined) {
            prop.primary.forEach(function (source, i) {
                if (i > 0) {
                    $primaryContainer.find(".sourceDiv:last").after(
                        makeSourceDiv(primary, auth, src, frag, textArea, coorType, qid, undefined)
                    );
                }
            });
        }
    }

    if (withForm) {
        $mainDiv.append($primaryContainer);
    }

    // noinspection PointlessBooleanExpressionJS
	if (qid !== undefined) {
        if ($mainDiv.children().length > 0) {
            $mainDiv.append("<hr>");
        }
        if (!withForm && narra.images[qid] !== undefined) {
            $mainDiv.append(
                "<div class='popoverContent'>" +
                        "<div class='popoverDiv'>" +
                        "<div class='popoverCell popoverCenter'>" +
                        "<img src='" + narra.images[qid] + "' alt='Entity image' >" +
                        "</div>" +
                        "</div>" +
                        "</div>"
            );
        }

        if (!withForm) {
            $mainDiv.append($imageDiv);
            $mainDiv.append($addImageDiv, '<hr>');
        }

        $mainDiv.append($wikiDiv);

        if (!withForm) {
            $mainDiv.append('<hr>', $deleteDiv);
        }

    }
    return $mainDiv.attr("data-id", qid);
}

// Load roles for person
function getRoles(qid) {
    var results = [];
    if (narra.items[qid] !== undefined && narra.items[qid].role !== undefined) {
        results = narra.items[qid].role;
    }
    return results;
}

// Get description for entity
function getDescription(qid) {
    if (qid in narra.items) {
        var desc = narra.items[qid][narra.currentLang + "Desc"].replace(/'/g, "&rsquo;");
        return (desc ? desc : typeFromArray(narra.items[qid].type));
    }
    return "";
}

// Set description for entity
function setDescription(qid, desc) {
    if (qid in narra.items) {
        narra.items[qid][narra.currentLang + "Desc"] = desc;
        saveObjectToDB(narra.items, qid);
        return true;
    }
    return false;
}

// Create popover title for entities
function makePopoverTitle(qid) {
    var size = "160%";
    if (getLabel(qid).length > 20) {
        size = "140%";
    }
	var deleteButton = "<div class='deleteButtonPopover' onclick='$(\".popover\").hide();'><b class='x'>×</b></div>";
    var title = "<span style='font-size: " + size + "'>" + getLabel(qid) + "</span>";
    var description = "<div class='popoverDesc' contenteditable='true' onkeydown='if (event.which === 13) { event.preventDefault(); $(this).blur(); }' onchange='setDescription(\"" + qid + "\", $(this).text())'>" + getDescription(qid) + "</div>";
    return deleteButton + title + description;
}

// Add popover to element
function addPopoverTo($element, withForm, evid, withoutArrow=false) {

	if (withoutArrow) {
		$element.popover({
			html: true,
			placement: function (context, source) {
				var position = $(source).position();

				if (position.left > 515 && position.bottom < 400) {
					return "left";
				}

				if (position.left < 515 && position.bottom < 400) {
					return "right";
				}

				if (position.top < 400) {
					return "bottom";
				}

				return "top";
			},
			container: "body",
			trigger: "manual",
			template: '<div class="popover withoutArrow" role="tooltip"><div class="popover-title"></div><div class="popover-content"></div></div>',
			title: function () {
				return makePopoverTitle($element.attr("data-id"));
			},
			content: makePopoverContent($element, withForm, evid),
			delay: {show: 70, hide: 70}
		});
	} else {
		$element.popover({
			html: true,
			placement: function (context, source) {
				var position = $(source).position();

				if (position.left > 515 && position.bottom < 400) {
					return "left";
				}

				if (position.left < 515 && position.bottom < 400) {
					return "right";
				}

				if (position.top < 400) {
					return "bottom";
				}

				return "top";
			},
			container: "body",
			trigger: "manual",
			title: function () {
				return makePopoverTitle($element.attr("data-id"));
			},
			content: makePopoverContent($element, withForm, evid),
			delay: {show: 70, hide: 70}
		});
	}

    $element.on("show.bs.popover", function(){
        $(this).data("bs.popover").tip().css("width", "28%");
    });

    return $element;
}

// Add popover to new entity element
function addNewEntityPopoverTo($element) {
    
    var addNewLabel = "Add New Entity";
    
    if (narra.currentLang === "it") {
        addNewLabel = "Aggiungi Nuova Entità";
    }
    
    $element.popover({
        html: true,
        placement: "right",
        container: "body",
        trigger: "focus",
        title: "<div class='deleteButtonPopover' onclick='$(\".popover\").hide();'><b class='x'>×</b></div><span style='font-size: 160%'>" + addNewLabel + "</span>",
        content: makeNewEntityPopoverContent(),
        delay: {show: 70, hide: 70}
    });

    $element.on("show.bs.popover", function(){
        $(this).data("bs.popover").tip().css("width", "24%");
    });

    $element.on("shown.bs.popover", function(){
		var newItemURI = $('#newItemURI');
        newItemURI.typeahead({
          hint: false,
          highlight: false,
          minLength: 3,
        }, {
          name: 'obj',
          limit: 10,
          display: function(obj) {return obj.label + (obj.description !== undefined ? ' (' + obj.description + ')' : '');},
          source: narra.suggestions
        });
        newItemURI.unbind('typeahead:select');
        newItemURI.val("").bind('typeahead:select', function(ev, suggestion) {
            $(this).parents('.popover').hide();
            addEntityFromIdOrURI(suggestion.id);
        });
    });

    return $element;
}

// Create content for new entity popover
function makeNewEntityPopoverContent() {
    var $mainDiv = $("<div>");
	var $inputChoice = $("<div class='popoverDiv form-group' id='entity-choice' onclick='event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation();'>")
		.append(
			$("<span id='entity-choice-text'>Choose how you want to add a new entity:</span><br>" +
				"<input type='radio' id='uri-radio' class='radioButtons radioEntityBtn' name='entity-choice' value='uri' onclick='addEntityListener(this)'>" +
				"<label for='uri-radio' class='radioButtonText'>Wikidata URI</label><br>" +
				"<input type='radio' id='manual-radio' class='radioButtons radioEntityBtn' name='entity-choice' value='manual' onclick='addEntityListener(this)'>" +
				"<label for='manual-radio' class='radioButtonText'>Manual</label><br>")
		);

    var $mainDiv2 = $("<div id='entity-content' style='display: block; visibility: hidden;'>").addClass("popoverContent").attr("onclick", "event.cancelBubble = true; if (event.stopPropagation) event.stopPropagation()");

    var $selectDiv = $("<div>").addClass("popoverContent").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Class:")
                            .addClass("popoverLabel")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<select required>")
                            .attr("id", "newEntityType")
                            .attr("class", "typeSelect")
                            .append(
                                $("<option disabled selected hidden>Select Class</option>"),
                                $("<option>").text("person"),
                                $("<option>").text("organization"),
                                $("<option>").text("object"),
                                $("<option>").text("concept"),
                                $("<option>").text("place"),
                                $("<option>").text("work"),
                                $("<option>").text("other")
                            )
                    )
            )
    );

    var hr = "<hr>";

    var $newEntityName = $("<div>").addClass("popoverContent").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Name:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newEntityName")
                    )
            )
    );

    var $newEntityDesc = $("<div>").addClass("popoverContent").css("margin-top", "2%").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Description:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newEntityDesc")
                    )
            )
    );

    var $newItemURI = $("<div id='uri-div' style='display: table; visibility: hidden;'>").addClass("popoverContent").css("margin-top", "2%").append(
        $("<div>")
            .addClass("popoverDiv")
            .append(
                $("<div>")
                    .addClass("popoverCell")
                    .append(
                        $("<label>")
                            .text("Search Wikidata:")
                            .addClass("popoverLabel")
                            .css("margin-top", "1%")
                            .css("margin-bottom", "1%")
                    ),
                $("<div>")
                    .addClass("popoverCell")
                    .css("text-align", "right")
                    .css("width", "60%")
                    .append(
                        $("<input>")
                            .attr("id", "newItemURI")
                    )
            )
    );
    
    var $addButtonDiv = $("<div id='div-entity-btn' style='display: block; visibility: hidden;'>").append(
        $("<div id='addEntityButton' class='btn btn-default' style='display: table' onclick='addEntityFromIdOrURI(); $(\".popover\").hide()'>Add</div>")
    );
    var $secondDiv = $("<div id='secondChoice' style='display: block; visibility: hidden;'>").append(
        hr,
        $selectDiv,
        hr,
        $newEntityName,
        $newEntityDesc
    );
    return $mainDiv.append($inputChoice, $mainDiv2.append($newItemURI, $secondDiv, $addButtonDiv));
}

// Function to add new entities from Wikidata ID or Wikidata/Wikipedia URI
function addEntityFromIdOrURI(value) {

	var missingData = false;

	// data validation
	if ($('#uri-radio').is(':checked')) {

		if ($('#newItemURI').val() == '') {
			missingData = true;
		}

	} else if ($('#manual-radio').is(':checked')) {
		var selectedOption = $("#newEntityType").find(":selected").text();

		if (selectedOption == 'Select Class' || selectedOption == '') {
			missingData = true;
		}

		if ($('#newEntityName').val() == '' || $('#newEntityDesc').val() == '') {
			missingData = true;
		}

	} else {
		missingData = true;
	}

	if (missingData) {
		fadeout('new-entity-error');
		return;
	}

    if (!value) {
        addEntity();
    } else {
        if (value.indexOf("wikipedia.org") > -1) {
            var title = value.split("/wiki/")[1];
            var lang = value.split("https://")[1].split(".wikipedia.org")[0];
            newEntityRequest(title, lang);
        } else if (value.startsWith("Q")) {
			var searchEntities = $("#controls .data[data-id=" + value + "]");
            if (searchEntities.length == 0) {
				sparqlRequest([value], narra.counter + 1, function (item) {
					addEntity(item);
				}, true, true);
			} else {
				$('.inner-shadow').removeClass("inner-shadow");
				searchEntities.addClass("inner-shadow");
				searchEntities.get(0).scrollIntoView();
			}
		} else if (value.indexOf("wikidata.org") > -1) {
            value = value.split("/wiki/").slice(-1)[0];
            sparqlRequest([value], narra.counter + 1, function (item) {
                addEntity(item);
            }, true, true);
        }
    }

	resetEntityPopover();
	hideEntityPopover();
	fadeout('new-entity-success');
}

// Get Wikidata class ID from class/type name
function getClassID(type) {
    type = type.toLowerCase();
    
    if (type === "other") {
        return "other";
    }
    if (type === "event") {
        return "Q1190554";
    }
    if (type === "person") {
        return "Q5";
    }
    if (type === "organization") {
        return "Q43229";
    }
    if (type === "concept") {
        return "Q7184903";
    }
    if (type === "object") {
        return "Q15222213";
    }
    if (type === "place") {
        return "Q17334923";
    }
    if (type === "work") {
        return "Q386724";
    }
}

function getNextUid() {
    return "U" + new Date().getTime() + Math.floor(Math.random() * 10000000);
}

// Add new entity
function addEntity(item) {
	var newEntityName = $("#newEntityName");
	var newEntityDesc = $("#newEntityDesc");
	var newEntityType = $("#newEntityType");
    if (!item) {
        if (newEntityName.val() !== "") {
            item = {
                "_id": getNextUid(),
                "_rev": undefined,
                "itName": newEntityName.val(),
                "enName": newEntityName.val(),
                "itDesc": newEntityDesc.val(),
                "enDesc": newEntityDesc.val(),
                "type": [getClassID(newEntityType.val())]
            };
            narra.items[item._id] = item;
            saveObjectToDB(narra.items, item._id);
        }
        else {
            return false;
        }
    }
	newEntityType.val("");
    newEntityName.val("");
    newEntityDesc.val("");
    $("#newItemURI").val("");
    
    var $element = addPopoverTo(makeStaticDraggable($(makeDataDiv(item._id, undefined))), false, undefined);

    $("#controls .data").each(function () {
        if ($(this).attr("data-id") === narra.subjectID) {
            return true;
        }
        if ($(this).text() > capitalize(item[narra.currentLang + "Name"])) {
            $element.insertBefore($(this)).fadeIn("fast");
            return false;
        }
    });
    
    $('.inner-shadow').removeClass("inner-shadow");
	var searchId = $("#controls .data[data-id=" + item._id + "]");
    searchId.addClass("inner-shadow");
    var itemToScrollTo = searchId.get(0);
    if (itemToScrollTo !== undefined) {
        console.log(currentTime() + 'Added ' + item._id + ' to list');
        itemToScrollTo.scrollIntoView();
    } else {
        console.log(currentTime() + 'Cannot load entity ' + item._id);
    }
}

function dataDivClick(div, withoutArrow=false) {
    if (div.parent().prop("className").indexOf("eventBottom") === -1) {
        event.stopPropagation();
        $(".popover:not([attr=" + div.attr("data-id") + "])").hide();
        if (!div.data("bs.popover")) {
			if (withoutArrow) {
				addPopoverTo(div, undefined, undefined, withoutArrow);
			} else {
				addPopoverTo(div);
			}
        } else {
            var ppvr = $(".popover[id='" + div.attr("aria-describedby") + "']");
            ppvr.find('.imageContentDiv').hide();
            ppvr.find('.imageLabelDiv > a').show();
        }
        div.popover("show");
		$(".popover-title").on("click", function(event) {
			event.cancelBubble = true;
			if (event.stopPropagation) event.stopPropagation();
		});
    }
}

// Create div representing an entity
function makeDataDiv(qid, withoutArrow=false) {
    if (narra.items[qid] !== undefined) {
        var type = typeFromArray(narra.items[qid].type);
		if (withoutArrow) {
			return "<a class='data " + type + "' role='button' tabindex=-1 data-id='" + qid + "' data-class='" + type + "' style='background-color: " + getColor(type) + "' " +
                "onclick='dataDivClick($(this), true)'>" +
                truncate(capitalize(getLabel(qid)), Math.floor(($("#controls").width() / 10) * parseInt($("body").css("font-size").replace("px", "")) / 40)) + "</a>";
		} else {
			return "<a class='data " + type + "' role='button' tabindex=-1 data-id='" + qid + "' data-class='" + type + "' style='background-color: " + getColor(type) + "' " +
                "onclick='dataDivClick($(this))'>" +
                truncate(capitalize(getLabel(qid)), Math.floor(($("#controls").width() / 10) * parseInt($("body").css("font-size").replace("px", "")) / 40)) + "</a>";
		}
    } else {
        return false;
    }
}

// Confirm removal of entity from event
function confirmRemove(entity) {
    showModal(
        "Remove Entity",
        "Removing the entity from the event will delete all the data you inserted in it. Are you sure you want to remove the entity?",
        "Keep Entity",
        "Remove Entity",
        function() {
            $("#inputDiv").children('.data').css("opacity", 1);
        },
        function() {
            entity.parent().find(".data[data-id=" +
                entity.attr("data-id") + "]").remove();

			// remove popover of the entity
			var aria = entity.attr("aria-describedby");
			if (aria !== undefined) {
				$(".popover[id=" + aria + "]").remove();
			}

			var inputDiv = $("#inputDiv");
            if (inputDiv.children().length === 1 && inputDiv.children().first().attr("id") === "inputHelp") {
                inputDiv.css("vertical-align", "middle");
                $("#inputHelp").show();
            }
        }
    );
}

// Make element draggable (with clone)
function makeStaticDraggable($element) {
    $element
        .draggable({
            helper: function (withPopover) {
                var $copy = $(this).clone();
                $copy.css("width", $(this).width());
				$copy.css("border-radius", 10);
                if (withPopover !== undefined) {
                    addPopoverTo($copy, true);
                }
                return $copy;
            },
            appendTo: "body",
            revert: false,
            scroll: false
        });
    return $element;
}

// Make element draggable (without clone)
function makeDraggable($element) {
    $element
        .draggable({
            helper: function () {
                $(".popover").hide();
                var $copy = $(this).clone();
                $copy.css("width", $(this).width());
				$copy.css("border-radius", 10);
                $(this).css("opacity", 0);
                addPopoverTo($copy, true);
                return $copy;
            },
            start: function (ignore, ui) {
                ui.helper.data('dropped', false);
            },
            stop: function (ignore, ui) {
                if (!ui.helper.data('dropped')) {
                    confirmRemove($(this));
                }
                else {
                    $(this).parent().find(".data[data-id=" + $(this).attr("data-id") + "]").css("opacity", 1);
                }
            },
            appendTo: "body",
            revert: "valid",
            scroll: false
        });
    return $element;
}

function manageWorkspace(addButton, workspace, buttonsToDisable, forceWorkspace) {
	if (forceWorkspace) {
		$("#event-type").css("display", "none");
		workspace.css("display", "block");
		if (buttonsToDisable.hasClass("disabledButton")) {
			buttonsToDisable.toggleClass("disabledButton");
		}
	} else {
		if (workspace.css("display") == "none") {
			$("#event-type").css("display", "none");
			workspace.css("display", "block");
			if (buttonsToDisable.hasClass("disabledButton")) {
				buttonsToDisable.toggleClass("disabledButton");
			}
			if (addButton.hasClass("add-button-active")) {
				addButton.toggleClass("add-button-active");
			}
		} else {
			workspace.css("display", "none");
			$("#event-type").css("display", "flex");
			buttonsToDisable.toggleClass("disabledButton");
			addButton.toggleClass("add-button-active");
		}
	}
}

function switchContainerEventType(forceWorkspace, checkChanges) {

	// always set workspace on top
	document.getElementById('workspace').scrollTop = 0;
	window.scrollTo(0, 0);

	var addButton = $("#addButton");
	var workspace = $("#workspace");
	var buttonsToDisable = $("#saveButton,#cancelButton");

	// remove class after the first load, set in startQueries()
	if (addButton.hasClass("disabledButton")) {
		addButton.toggleClass("disabledButton");
	}

	// show modal if it is allowed to check changes, workspace is not empty, there are no new changes and 'New Event' button is not active
    if ((checkChanges) && (!workspaceIsEmpty()) && (!checkNewChanges()) && (!addButton.hasClass("add-button-active"))) {
        showModal(
            "Confirm new event",
            "Changes made to the current event will be lost. Are you sure to proceed?",
            "Cancel",
            "Create new event",
            function () {
            },
            function () {
				resetWorkspace();
				manageWorkspace(addButton, workspace, buttonsToDisable, forceWorkspace);
            }
        );
    } else {
        manageWorkspace(addButton, workspace, buttonsToDisable, forceWorkspace);
    }
}

function returnToInterface(toSwitch, checkChanges) {
    if (toSwitch){
        switchContainerEventType(true, checkChanges);
    } else {
        switchContainerEventType(false, checkChanges);
    }
}

// Textarea height fit with content on load
function setTextareaHeight(textarea) {
    if (textarea.value != '' && textarea.id != 'polygonArea') {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    } else {
        textarea.style.height = 'auto';
    }
}

function displayWorkspace(typeString, returnToUI, checkChanges) {
	var eventTypeText = document.getElementById('event-type-text');
    formType = typeString;
    // Show common fields for all types
    document.getElementById('place-group').style.display = "none";
    document.getElementById('title-group').style.display = "block";
    document.getElementById('entitiesDiv').style.display = "table";
    document.getElementById('entitiesLabel').style.display = "table-row";
    document.getElementById('descDiv').style.display = "table";
    document.getElementById('even-source-div').style.display = "table";
    document.querySelector('.image-group').style.display = "flex";
    document.getElementById('caption-group').style.display = "block";
    document.getElementById('digobjDiv').style.display = "table";
    document.getElementById('digobjTable').style.display = "flex";
    document.getElementById('position-group').style.display = "block";
	document.getElementById('coors-map').style.display = "none";
	document.getElementById('polygon').style.display = "none";
	document.getElementById('event-type-label').style.display = "inline-flex";
	eventTypeText.style.display = "inline-flex";
	eventTypeText.textContent = formType;

    if (formType == "map") {
		document.getElementById('location-title').style.display = "block";
        document.getElementById('choose-coors').style.display = "block";
        document.getElementById('date-group').style.display = "table";
        document.getElementById('typeDiv').style.display = "block";
        document.getElementById('id-group').style.display = "none";
        document.getElementById('number-group').style.display = "none";
		document.getElementById('place-group').style.display = "block";
		document.getElementById('backImgDiv').style.display = "none";
    } else if (formType == "sketchfab") {
		document.getElementById('location-title').style.display = "none";
        document.getElementById('choose-coors').style.display = "none";
        document.getElementById('date-group').style.display = "none";
        document.getElementById('typeDiv').style.display = "none";
        document.getElementById('id-group').style.display = "block";
        document.getElementById('number-group').style.display = "block";
		document.getElementById('place-group').style.display = "none";
		document.getElementById('backImgDiv').style.display = "none";
    } else {
		document.getElementById('location-title').style.display = "none";
        document.getElementById('choose-coors').style.display = "none";
        document.getElementById('date-group').style.display = "table";
        document.getElementById('typeDiv').style.display = "block";
        document.getElementById('id-group').style.display = "none";
        document.getElementById('number-group').style.display = "none";
		document.getElementById('place-group').style.display = "none";
		document.getElementById('backImgDiv').style.display = "flex";
    }

    if (returnToUI) {
        returnToInterface(true, checkChanges);
    } else {
        returnToInterface(false, checkChanges);
    }
    $("#exit-type").css("display", "block");
    $("#addButton,#saveButton,#cancelButton").css("visibility", "visible");
}

function makeDigObjArray() {
	var arrayResults = [];
	var results = {};
	$("#digobjTable .digobjPreview").each(function () {
		results = {};
		results.url = (decodeURIComponent($(this).attr("data-url")));
		results.title = ($(this).find("span").text());
		arrayResults.push(results);
	})
	if (Object.keys(results).length > 0) return arrayResults;
	else return "";
}

function getPosition(positionAfter, positionBefore, evid) {

	var pos;
	var positionEvent = $("#positionEvent option");

	// position of my event if it is moved after another event
	if (positionAfter.is(':checked')) {

		pos = switchPositionEvent("after", positionEvent.filter(':selected').val(), evid);

	// position of my event if it is moved before another event
	} else if (positionBefore.is(':checked')) {

		pos = switchPositionEvent("before", positionEvent.filter(':selected').val(), evid);

	// position of my event if it is not moved and if we MODIFY an event
	} else if (narra.events[evid] != undefined) {

		pos = parseInt(narra.events[evid].position);

	// if position is moved OR it is a NEW event
	} else {

		pos = nextEventPosition();

	}

	return pos;
}

function makeMapColor(typeInput) {

	var mc;

	if (typeInput.val() == "history" || typeInput.val() == "historical event") {
		mc = "#e6e600";
	} else if (typeInput.val() == "descriptive event") {
		mc = "#0000CD";
	} else if (typeInput.val() == "nature" || typeInput.val() == "natural event") {
		mc = "#2eb82e";
	} else if (typeInput.val() == "value chain" || typeInput.val() == "valorisation event") {
		mc = "#ff9900";
	} else {
		mc = "#a5a5a5";
	}

	return mc;
}

function getImagesAndVideo(evid, imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideoSelector, eventVideo, eventVideoCaption, videoRadio, fromSaveEvent, nothingChanged) {

	// get background image
	eventBackImg = $("#backImgArea").val().trim();
	if ($('#selectEventLocalBackgroundImage').text() != 'Upload image' && fromSaveEvent) {
		// it means that there is a new image to upload
		nothingChanged = false;
	}
	// manage local image (if URL link or local image)
	var localBackgroundImageEvent = $('#backImgInput').prop('files');
	if (localBackgroundImageEvent.length > 0) {
		eventBackImg = "https://tool.dlnarratives.eu/images/" + narra.id_n + "-" + narra.user + "-" + evid + "-SlideBg." + localBackgroundImageEvent[0].type.split("/")[1];
		uploadEventImg(localBackgroundImageEvent[0], evid, "SlideBg");
	}

	var eventMediaSelector = $(".eventMedia");

	// check if image-radio button is checked and if there is only one image...
	if (eventMediaSelector.length < 2) {
		if ($("#image-radio").is(':checked')) {
			// clear video
			eventVideoSelector.val('');
			$("#eventVideoCaption").val('');

			eventMedia = $("#eventMedia").val().trim();

			imageButton = $('#selectEventLocalImage').text();

			if (imageButton != 'Upload image' && fromSaveEvent) {
				// it means that there is a new image to upload
				nothingChanged = false;
			}

			// manage local image (if URL link or local image)
			var localImageEvent = $('#eventImageInput').prop('files');
			eventMediaCaption = $("#eventMediaCaption").val().trim();

			if (localImageEvent.length > 0) {
				eventMedia = "https://tool.dlnarratives.eu/images/" + narra.id_n + "-" + narra.user + "-" + evid + "." + localImageEvent[0].type.split("/")[1];
				uploadEventImg(localImageEvent[0], evid);
			}
		} else {
			eventMedia = "";
			eventMediaCaption = "";
		}
	} //...otherwise if there are many images and image-radio is checked...
	else if ($("#image-radio").is(':checked')) {
		// clear video
		eventVideoSelector.val('');
		$("#eventVideoCaption").val('');

		eventMedia = [];
		eventMediaCaption = [];
		var countCaptions = 0;
		eventMediaSelector.each(function (){
			imageButton = $(this).parent().siblings('div.button-image-div').children('button.selectEventLocalImage').text();

			if (imageButton != 'Upload image' && fromSaveEvent) {
				// it means that there is a new image to upload
				nothingChanged = false;
			}

			var imageEventUrl = $(this).val().trim();
			var localImageEvent = $(this).parent().siblings('input.eventImageInput').prop('files');
			var thisCaption = $(this).parent().parent().parent().siblings(':first').children(':nth-child(2)').val().trim();
			eventMediaCaption.push(thisCaption);

			if (localImageEvent.length > 0) {
				imageEventUrl = "https://tool.dlnarratives.eu/images/" + narra.id_n + "-" + narra.user + "-" + evid + "-" + countCaptions + "." + localImageEvent[0].type.split("/")[1];
				uploadEventImg(localImageEvent[0], evid, countCaptions);
			}

			eventMedia.push(imageEventUrl);
			countCaptions += 1;
		});
	} // ...otherwise clear images
	else {
		eventMedia = "";
		eventMediaCaption = "";
	}

	// check if video-radio button is checked
	if (videoRadio.is(':checked')) {
		eventVideo = eventVideoSelector.val().trim();
		eventVideoCaption = $("#eventVideoCaption").val().trim();
		// clear images
		eventMediaSelector.each(function (){
			$(this).parent().siblings('div.button-image-div').children('button.selectEventLocalImage').text('Upload image');
			$(this).val('');
			$(this).parent().siblings('input.eventImageInput').val('');
			$(this).parent().parent().parent().siblings(':first').children(':nth-child(2)').val('');
		});
	} else {
		eventVideo = "";
		eventVideoCaption = "";
	}

	return [imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideo, eventVideoCaption];
}

function getCoords(polygonArea, polygon, lat, long, latitud, longitud) {

	// if polygon is checked
	if ($("#polygon-radio").is(':checked')) {

		// get polygonArea value and set empty lat, long
		polygon = polygonArea.val().trim();
		lat = '';
		long = '';

	} else {

		// otherwise do the opposite
		polygon = '';
		lat = latitud.val().trim();
		long = longitud.val().trim();

	}

	return [polygon, lat, long];
}

function makeTemp(evid, eventTitle, dateInputStart, dateInputEnd, typeInput, eventBackImg, props, lat, long, polygon, eventVideo, eventVideoCaption, eventMedia, eventMediaCaption, position, mapColor, formType, idText, numberText) {

	var t;

	if (formType == "map") {
		t = {
			"_id": evid,
			"_rev": (narra.events[evid] === undefined ? undefined : narra.events[evid]._rev),
			"title": eventTitle.val().trim(),
			"start": dateFromString(dateInputStart.val().trim(), false),
			"end": dateFromString(dateInputEnd.val().trim(), false),
			"type": typeInput.val().trim(),
			"description": $("#descArea").val().trim(),
			"source": $("#event-source").val().trim(),
			"eventPlaceLabel": $("#placeLabel").val().trim(),
			"objurl": makeDigObjArray(),
			"props": props,
			"latitud": lat,
			"longitud": long,
			"polygon": polygon,
			"eventVideo": eventVideo,
			"eventVideoCaption": eventVideoCaption,
			"eventMedia": eventMedia,
			"eventMediaCaption": eventMediaCaption,
			"position": position,
			"mapMarkerColor": mapColor,
			"formType": formType,
			"mapZoom": ""
		};
	} else if (formType == 'sketchfab') {
		t = {
			"_id": evid,
			"_rev": (narra.events[evid] === undefined ? undefined : narra.events[evid]._rev),
			"title": eventTitle.val().trim(),
			"start": dateFromString(dateInputStart.val().trim(), false),
			"end": dateFromString(dateInputEnd.val().trim(), false),
			"type": typeInput.val().trim(),
			"description": $("#descArea").val().trim(),
			"source": $("#event-source").val().trim(),
			"objurl": makeDigObjArray(),
			"props": props,
			"eventVideo": eventVideo,
			"eventVideoCaption": eventVideoCaption,
			"eventMedia": eventMedia,
			"eventMediaCaption": eventMediaCaption,
			"sketchfabid": idText.val().trim(),
			"annotationNumber3DModel": numberText.val().trim(),
			"position": position,
			"formType": formType
		};
	} else {
		// slide event
		t = {
			"_id": evid,
			"_rev": (narra.events[evid] === undefined ? undefined : narra.events[evid]._rev),
			"title": eventTitle.val().trim(),
			"start": dateFromString(dateInputStart.val().trim(), false),
			"end": dateFromString(dateInputEnd.val().trim(), false),
			"type": typeInput.val().trim(),
			"description": $("#descArea").val().trim(),
			"backgroundImg": eventBackImg,
			"source": $("#event-source").val().trim(),
			"objurl": makeDigObjArray(),
			"props": props,
			"eventVideo": eventVideo,
			"eventVideoCaption": eventVideoCaption,
			"eventMedia": eventMedia,
			"eventMediaCaption": eventMediaCaption,
			"position": position,
			"formType": formType,
			"slidePosition": "",
			"textBackground": ""
		};
	}

	return t;
}

function manageDifferentProperties(event, temp) {

	if (event.hasOwnProperty('location')) {
		temp.location = event.location;
	}

	if (event.hasOwnProperty('media')) {
		temp.media = event.media;
	}

	if (event.hasOwnProperty('text')) {
		temp.text = event.text;
	}

	if (event.hasOwnProperty('start_date')) {
		temp.start_date = event.start_date;
	}

	if (event.hasOwnProperty('end_date')) {
		temp.end_date = event.end_date;
	}

	if (event.hasOwnProperty('date')) {
		temp.date = event.date;
	}

	// this is for default events which contains this property
	if (event.hasOwnProperty('itTitle')) {
		temp.itTitle = event.itTitle;
	}

	// if event.notes has content, save it in event.source and then delete it
	if (event.hasOwnProperty('notes')) {
		if (event.notes == "") {
			delete event.notes;
		} else {
			event.source = event.notes;
			delete event.notes;
		}
	}

	// add new properties if event does not have them - default value
	if (!event.hasOwnProperty('formType')) {
		event.formType = "map";
	}

	// adjust polygon
	if (!event.hasOwnProperty('polygon') && (event.formType == "map")) {
		event.polygon = "";
	} else if (event.hasOwnProperty('polygon') && (event.formType != "map")) {
		delete event.polygon;
	}

	if (!event.hasOwnProperty('source')) {
		event.source = "";
	}

	if (!event.hasOwnProperty('eventPlaceLabel') && (event.formType == 'map')) {
		event.eventPlaceLabel = "";
	}

	if (!event.hasOwnProperty('mapZoom') && (event.formType == 'map')) {
		event.mapZoom = "";
		temp.mapZoom = "";
	}

	if (!event.hasOwnProperty('backgroundImg') && (event.formType == 'slide')) {
		event.backgroundImg = "";
	}

	if (!event.hasOwnProperty('slidePosition') && (event.formType == 'slide')) {
		event.slidePosition = "";
		temp.slidePosition = "";
	}

	if (!event.hasOwnProperty('textBackground') && (event.formType == 'slide')) {
		event.textBackground = "";
		temp.textBackground = "";
	}

	if (event.hasOwnProperty('unique_id')) {
		temp.unique_id = event.unique_id;
	}

}

function checkNewChanges() {
    // check data-evid attr of #workspace
    const pattern = /ev/;
    var id = $(this).attr("id");
    var parentId = $(this).parent().attr("id");
	var workspace = $("#workspace");
    var workspaceEvid = workspace.attr("data-evid");
	var propsNotChanged = true;

    if ((pattern.test(workspaceEvid)) || (pattern.test(id)) || (pattern.test(parentId))) {
        try {

            var evid = workspace.attr("data-evid");
            if (!evid) {
                if ((pattern.test(id)) || (pattern.test(parentId))) {
                    evid = $(this).attr("id");
                } else {
                    // it means that there is no id available for the event
                    return true;
                }
            }
            if (typeof evid === 'undefined') {
                // it means that no events were loaded before
                return true;
            }

            // Check user's input
            var props = {};

			var dateInputStart = $("#dateInputStart");
			var dateInputEnd = $("#dateInputEnd");

            if (!dateInputEnd.val()) {
                dateInputEnd.val(dateInputStart.val());
            }

			// get the position of the event in the narrative
			var positionAfter = $('#positionAfter');
			var positionBefore = $('#positionBefore');
			var position = getPosition(positionAfter, positionBefore, evid);

            $("#inputDiv .data").each(function () {
				var thisId = $(this).attr("data-id");

                if ($(this).attr("aria-describedby") === undefined) {

                    props[thisId] = narra.events[evid].props[thisId];

                } else {

                    var $popover = $("#" + $(this).attr("aria-describedby"));

					// find correct value of role
					var role;
					if ($(".roleInput").hasClass("hidden")) {
						role = $popover.find(".roleSelect").val();
					} else {
						role = $popover.find(".roleInput").val();
					}

                    props[thisId] = {
                        "title": $popover.find("span").first().text(),
                        "class": $(this).attr("data-class"),
                        "role": role,
                        "description": $popover.find(".descArea").val(),
                        "notes": $popover.find(".event-source").val()
                    }

					// get map visual filter
					var radioFilterValue = $popover.find(".radioButtons:checked").val();

					var eventExists = evid in narra.events;

					if (!(eventExists) || !(thisId in narra.events[evid].props)) {
						propsNotChanged = false;
					} else if (eventExists && (radioFilterValue !== narra.events[evid].props[thisId].showOnMap)) {
						propsNotChanged = false;
					}

					props[thisId].showOnMap = radioFilterValue;

					// Remove undefined properties
					props[thisId] = Object.fromEntries(Object.entries(props[thisId]).filter(([_, v]) => v !== undefined));

					// Check if there are some missing values in narra.events[evid].props[thisId] that are present in temp (props[thisId])
					// for backwards compatibility
					Object.entries(props[thisId]).forEach(([key, value]) => {
						if (eventExists && thisId in narra.events[evid].props && key != 'showOnMap' && narra.events[evid].props[thisId][key] === undefined) {
							narra.events[evid].props[thisId][key] = value;
						}
					});


				}
            });

			// get map markers colors
			var typeInput = $("#typeInput");
			var mapColor = makeMapColor(typeInput);

			// get background image and image(s) or video
			var eventVideoSelector = $("#eventVideo");
			var videoRadio = $("#video-radio");
			var [imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideo, eventVideoCaption] =
				getImagesAndVideo(evid, imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideoSelector, eventVideo, eventVideoCaption, videoRadio, false);

			// get coordinates
			var polygonArea = $("#polygonArea");
			var latitud = $("#latitud");
			var longitud = $("#longitud");
			var [polygon, lat, long] = getCoords(polygonArea, polygon, lat, long, latitud, longitud);

            if (narra.events[evid] === undefined) {
                // it means that it's a new event
                return false;
            }
            if (narra.events[evid]["formType"] === undefined) {
                formType = "map";
            } else {
                formType = narra.events[evid]["formType"];
            }

			var eventTitle = $("#eventTitle");
			var idText = $("#id-text");
			var numberText = $("#number-text");
			var temp = makeTemp(evid, eventTitle, dateInputStart, dateInputEnd, typeInput, eventBackImg, props, lat, long, polygon, eventVideo, eventVideoCaption,
				eventMedia, eventMediaCaption, position, mapColor, formType, idText, numberText);

			var event = narra.events[evid];
			// delete in case the delta is only the revision version of the event
            if (typeof temp._rev === 'undefined') {
                delete temp._rev;
            }

			// section for older events that had different properties
			if (event.hasOwnProperty('date') && event.date == 'NaN-NaN') {
				delete event.date;
			}

			manageDifferentProperties(event, temp);

            // here is where it does the comparison between last save and actual form - it is true if they are equal
            return checkChangesFromLastSave(event, temp) && propsNotChanged;
        } catch (error) {
            console.error("An error occurred while checking the event:", error);
            fadeout('failed-checking', 1200);
        }
    } else {
        // it means that is immediately after onload - there are no changes so return true
        return true;
    }
}

function loadEventType(typeString, returnToUI, checkChanges) {
    resetWorkspace();
    displayWorkspace(typeString, returnToUI, checkChanges);
}

function confirmReset() {
    if (!workspaceIsEmpty()) {
        showModal(
            "Clear form",
            "Are you sure you want to clear all the event information?",
            "Cancel",
            "Clear Form",
            function() {
            },
            function() {
                try {
                    resetWorkspace();
					$("#workspace").attr("data-evid", nextEvid());
                    fadeout('clear-form');
                } catch (error) {
                    console.error("An error occurred while clearing the form:", error);
                    fadeout('failed-clear', 1200);
                }
            }
        );
    }
    else {
        try {
            resetWorkspace();
			$("#workspace").attr("data-evid", nextEvid());
            fadeout('clear-form');
        } catch (error) {
            console.error("An error occurred while clearing the form:", error);
            fadeout('failed-clear', 1200);
        }
    }
}

// Reset all elements in the workspace
function resetWorkspace() {

	var latitud = $("#latitud");
	var longitud = $("#longitud");
	var polygonArea = $("#polygonArea");
	var dateInputStart = $("#dateInputStart");
	var dateInputEnd = $("#dateInputEnd");
	var inputDiv = $("#inputDiv");
	var idText = $("#id-text");
	var numberText = $("#number-text");

    $(".spinner").hide();
    $('#eventTitle').val("");

    updateEventTypes();
    updateTitle();

    $("label").css("background-color", function () {
        return getColor($(this).attr("data-class"));
    });
    $(".nav").css("background-color", function () {
        return getColor($(this).attr("data-class"));
    });

    $("#workspace .form-group, #workspace .form-inline, #workspace .input-group, #entitiesDiv, .twitter-typeahead, .radioCoorsLabel").removeClass("has-error");
	$(".radioCoorsLabel").removeClass("has-error-coors");
	latitud.removeClass("has-error-coors");
	longitud.removeClass("has-error-coors");
	polygonArea.removeClass("has-error-coors");
	dateInputStart.removeClass("has-error-date");
	dateInputEnd.removeClass("has-error-date");
	idText.removeClass("has-error-sketch");
	numberText.removeClass("has-error-sketch");

    if (narra.currentLang === "en") {
        inputDiv.empty().css("vertical-align", "middle").append("<div id='inputHelp'>Drop entities here!</div>");
    } else if (narra.currentLang === "it") {
        inputDiv.empty().css("vertical-align", "middle").append("<div id='inputHelp'>Trascina le entità qui!</div>");
    }

    $("#typeInput").val("");
    $("#topicInput").val("");
    $(".dateInput").val("");

	$("#backImgArea").val('');
	$("#eventVideo").val("");
	$("#eventMedia").val("");
	$('#eventVideoCaption').val("");
	$('#eventMediaCaption').val("");

	// check if there are more than one image sections
	if ($(".image-caption-group").length > 1) {
		$(".image-caption-group:not(#image-caption-group)").each(function (){
			$(this).remove();
		});
	}

	$(".radioVideoBtn").prop('checked', false);
	$(".radioCoorsBtn").prop('checked', false);
	$("#video-caption-group").css("display", "none");
	$("#image-caption-group, #add-image").css("display", "none");

	$("#backImgInput").val('');
    $("#eventImageInput").val('');
    polygonArea.val('');
	latitud.val('');
	longitud.val('');
    $("#placeLabel").val('');
    $("#selectEventLocalBackgroundImage").text("Upload image");
	$("#selectEventLocalImage").text("Upload image");
    idText.val('');
    numberText.val('');
    document.getElementById("positionBefore").checked = false;
    document.getElementById("positionAfter").checked = false;
	$("#positionEvent").val('');

	$("#coors-map").css("display", "none");
	$("#polygon").css("display", "none");

    dateInputStart.click(function () {
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (dateIsValid(dateInputStart.val())) {
            dateInputStart.popover("show");
        }
    });

    dateInputEnd.click(function () {
        event.cancelBubble = true;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (dateIsValid(dateInputEnd.val())) {
            dateInputEnd.popover("show");
        }
    });

    $("#descArea").val("");
    $("#event-source").val("");
    $("#digobjInput").val("");
    $("#digobjTitle").val("");
    $("#digobjTable").empty();

    inputDiv.droppable({
        drop: function (ignore, ui) {

			// start polygon check
			var evid = $("#workspace").attr("data-evid");
            var qidK = ui.draggable.attr("data-id");

			if (ui.draggable.attr("data-class")  === "place") {

				var url = "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
				var queryOSM = url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

				$.getJSON(queryOSM, function(data) {

					var aria = $("#inputDiv").children(".data[data-id=" + qidK + "]").attr("aria-describedby");

					var radioDiv = $(".popover[id="+ aria + "]").find('#popover-radio-div-' + qidK);
					radioDiv.empty();

					if (data.results.bindings.length > 0) {

						var radioPoint = "";
						var radioPolygon = "";
						var copyTitle = "";
						var copyPoint = "";
						var copyPol = "";

						for (var h=0; h < data.results.bindings.length; h++) {

							// if the query result is a point
							if (data.results.bindings[h].wkt.value.toUpperCase().startsWith("POINT")) {

								narra.items[qidK].coordinatesPoint = data.results.bindings[h].wkt.value;
								copyTitle = "<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>";
								copyPoint = "<div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-lat" + qidK + "' value='lat' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-coors-lat" + qidK + "' class='radioButtonText radioEntities'>Latitude</label></div><div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qidK + "' value='long' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-coors-long" + qidK + "' class='radioButtonText radioEntities'>Longitude</label></div></div>";

								if (radioPoint == '' && narra.items[qidK].hasOwnProperty('coordinatesPoint')) {
									if (evid in narra.events && qidK in narra.events[evid].props && 'showOnMap' in narra.events[evid].props[qidK]) {
										if (narra.events[evid].props[qidK].showOnMap == 'showPoint') {

											// checked
											radioPoint += "<input type='radio' id='showEntityPoint" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPoint' checked='checked'/>" +
												"<label for='showEntityPoint" + qidK + "' id='showEntityPointLabel" + qidK + "' class='radioButtonText radioEntities'>Show point</label><br>";

										} else {

											radioPoint += "<input type='radio' id='showEntityPoint" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPoint'/>" +
												"<label for='showEntityPoint" + qidK + "' id='showEntityPointLabel" + qidK + "' class='radioButtonText radioEntities'>Show point</label><br>";

										}
									} else {

										radioPoint += "<input type='radio' id='showEntityPoint" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPoint'/>" +
												"<label for='showEntityPoint" + qidK + "' id='showEntityPointLabel" + qidK + "' class='radioButtonText radioEntities'>Show point</label><br>";

									}
								}

							// if the query result is a polygon
							} else if (data.results.bindings[h].wkt.value.toUpperCase().startsWith("MULTIPOLYGON") || data.results.bindings[h].wkt.value.toUpperCase().startsWith("POLYGON")) {

								narra.items[qidK].coordinatesPolygon = data.results.bindings[h].wkt.value;
								copyTitle = "<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>";
								copyPol = "<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qidK + "' value='pol' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-pol" + qidK + "' class='radioButtonText radioEntities'>Polygon</label></div>";

								if (radioPolygon == '' && narra.items[qidK].hasOwnProperty('coordinatesPolygon')) {
									if (evid in narra.events && qidK in narra.events[evid].props && 'showOnMap' in narra.events[evid].props[qidK]) {
										if (narra.events[evid].props[qidK].showOnMap == 'showPol') {

											// checked
											radioPolygon += "<input type='radio' id='showEntityPolygon" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPol' checked='checked'/>" +
												"<label for='showEntityPolygon" + qidK + "' id='showEntityPolygonLabel" + qidK + "' class='radioButtonText radioEntities'>Show polygon</label><br>";

										} else {

											radioPolygon += "<input type='radio' id='showEntityPolygon" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPol'/>" +
												"<label for='showEntityPolygon" + qidK + "' id='showEntityPolygonLabel" + qidK + "' class='radioButtonText radioEntities'>Show polygon</label><br>";

										}
									} else {

										radioPolygon += "<input type='radio' id='showEntityPolygon" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPol'/>" +
												"<label for='showEntityPolygon" + qidK + "' id='showEntityPolygonLabel" + qidK + "' class='radioButtonText radioEntities'>Show polygon</label><br>";

									}
								}

							}
						}

						// those two serve when .droppable() is not able to find the entity's property whereas it is actually saved in narra.items
                        if (!radioPoint && narra.items[qidK].hasOwnProperty('coordinatesPoint')) {

							if (evid in narra.events && qidK in narra.events[evid].props && narra.events[evid].props[qidK].showOnMap == 'showPoint') {

								// checked
								radioPoint += "<input type='radio' id='showEntityPoint" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPoint' checked='checked'/>" +
									"<label for='showEntityPoint" + qidK + "' id='showEntityPointLabel" + qidK + "' class='radioButtonText radioEntities'>Show point</label><br>";

							} else {

								radioPoint += "<input type='radio' id='showEntityPoint" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPoint'/>" +
									"<label for='showEntityPoint" + qidK + "' id='showEntityPointLabel" + qidK + "' class='radioButtonText radioEntities'>Show point</label><br>";

							}

							copyPoint = "<div class='div-copy-coors' id='copy-point'><div id='div-copy-lat' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-lat" + qidK + "' value='lat' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-coors-lat" + qidK + "' class='radioButtonText radioEntities'>Latitude</label></div><div id='div-copy-long' class='div-copy-coors'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-coors-long" + qidK + "' value='long' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-coors-long" + qidK + "' class='radioButtonText radioEntities'>Longitude</label></div></div>";

						}
						 if (!radioPolygon && narra.items[qidK].hasOwnProperty('coordinatesPolygon')) {

							 if (evid in narra.events && qidK in narra.events[evid].props && narra.events[evid].props[qidK].showOnMap == 'showPol') {

								 // checked
								 radioPolygon += "<input type='radio' id='showEntityPolygon" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPol' checked='checked'/>" +
									 "<label for='showEntityPolygon" + qidK + "' id='showEntityPolygonLabel" + qidK + "' class='radioButtonText radioEntities'>Show polygon</label><br>";

							 } else {

								 radioPolygon += "<input type='radio' id='showEntityPolygon" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showPol'/>" +
								 "<label for='showEntityPolygon" + qidK + "' id='showEntityPolygonLabel" + qidK + "' class='radioButtonText radioEntities'>Show polygon</label><br>";

							 }
							 copyPol = "<div class='div-copy-coors' id='copy-pol'><button type='button' class='btn btn-default btn-copy-coors' id='btn-copy-pol" + qidK + "' value='pol' onclick='copyToClipboard(this.value, \"" + qidK + "\", this.id);'><i class='fa-regular fa-copy'></i></button>" +
								"<label for='btn-copy-pol" + qidK + "' class='radioButtonText radioEntities'>Polygon</label></div>";

						}

						if (evid in narra.events && qidK in narra.events[evid].props && 'showOnMap' in narra.events[evid].props[qidK] && narra.events[evid].props[qidK].showOnMap == 'showNothing') {
							radioDiv.append("<h5 class='showEntity-title'>Visual filter on the map</h5>" +
								"<div class='form-group'>" + radioPoint + radioPolygon +
								"<input type='radio' id='showEntityNothing" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showNothing' checked='checked'/>" +
								"<label for='showEntityNothing" + qidK + "' class='radioButtonText radioEntities'>Show nothing</label><br>" +
								"<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>" +
								copyPoint +
								copyPol);
						} else if (radioPoint != '' || radioPolygon != '') {
							radioDiv.append("<h5 class='showEntity-title'>Visual filter on the map</h5>" +
								"<div class='form-group'>" + radioPoint + radioPolygon +
								"<input type='radio' id='showEntityNothing" + qidK + "' class='radioButtons' name='show-entity" + qidK + "' value='showNothing'/>" +
								"<label for='showEntityNothing" + qidK + "' class='radioButtonText radioEntities'>Show nothing</label><br>");
						}

						if ((!(evid in narra.events) || !(qidK in narra.events[evid].props) || !('showOnMap' in narra.events[evid].props[qidK]) || (narra.events[evid].props[qidK].showOnMap == undefined)) && (radioPoint != '' || radioPolygon != '')) {
							radioDiv.append("<br><h5 class='showEntity-title'>Copy the coordinates to the clipboard</h5>" +
								copyPoint +
								copyPol +
								"</div>");
						} else {
							radioDiv.append("</div>");
						}

						//save entity with point and polygon updated
						saveObjectToDB(narra.items, qidK);
					} else {
						radioDiv.append("<h5 class='showEntity-title'>Visual filter on the map</h5>" +
							"<div class='form-group'>" + "<p class='no-coords-popover'>No coordinates found.</p>" +
							"</div>"
						);
					}

				}).fail(function() { console.log("OSM Query error"); });

			}
            // end polygon check

            ui.helper.data("dropped", true);
            $(this).parents('.form-group, .form-inline, #entitiesDiv, .twitter-typeahead').removeClass("has-error");
            $(this).css("vertical-align", "top");
            $("#inputHelp").hide();
            if ($("#inputDiv .data[data-id=" + ui.draggable.attr("data-id") + "]").length === 0) {
                var $drag = ui.draggable.clone();
                makeDraggable($drag);
                $drag.popover("destroy");
                addPopoverTo($drag, true);
                $drag.mousedown(
                    function () {
                        $(".popover:not([attr=" + $(this).attr("data-id") + "])").hide();
                    }
                );
                $(this).append($drag.css("opacity", 1));
                updateDataText($drag, narra.currentLang);
                $drag.click();
                $drag.focus();
                showPopoverForDiv($drag);
            }
        },
        out: function () {
            $(this).text($(this).attr("data-default"));
        }
    });

    $('.optionSel').show();

    // markerMapColor default
    $("#markerMapColor").val("#a5a5a5");

    // Set textarea height
    var textareas = document.getElementsByTagName('textarea');
    for (var elem of textareas) {
        setTextareaHeight(elem);
    }

}

// Show popover for specific element
function showPopoverForDiv(element) {
    $(".popover:not([attr='" + element.attr("data-id") + "'])").hide();
    if (element.attr("aria-describedby") != undefined) {
        $(".popover[id='" + element.attr("aria-describedby") + "']").show();
    } else element.popover("show");
}

// Update text of an entity element
function updateDataText($element) {
    $element.text(function () {
        return truncate(capitalize(getLabel($element.attr("data-id"))), Math.floor(($element.width() * 0.39) * parseInt($("body").css("font-size").replace("px", "")) / 40));
    });
}

// Update language of labels of all entity elements
function updateDataLang() {
    $(".data").each(function () {
        $(this).text(truncate(capitalize(getLabel($(this).attr("data-id"))), Math.floor(($(this).width() * 0.39) * parseInt($("body").css("font-size").replace("px", "")) / 40)));
    });
    $("#inputDiv .data").each(function () {
        $(this).popover("destroy");
        addPopoverTo($(this), false);
    });
}

// Make title of narrative
function makeTitle() {
	
	var type = typeFromArray(narra.items[narra.subjectID].type);
   
   if (narra.currentLang === "it") {
        if (type === "person") {
			return "";
        } else {
            return "";
        }
    } else {
        if (type === "person") {
			return "";
        } else {
            return "";
        }
    }
} 

// Update title of narrative
function updateTitle() {
    var title = $('meta[name=subjectName]').attr("content");
    $(document).prop("title", title);
	
	$.ajax({
		type: "GET",
		url: "PHP//narrationTitle.php",
		dataType: "JSON",
		data: {dbusername: narra.user +'-'+narra.dbName, idNarra: narra.id_n, firstTitle:narra.items[narra.subjectID].enName},
		success: function(resp) {

			// at the beginning (if A1 -> 'name' is ""), title will be subject of narration
			if (resp.title == "") {

				$("#bigName").text(/* makeTitle() +  */ titlecase(narra.items[narra.subjectID].enName));

				console.log(titlecase(narra.items[narra.subjectID].enName));

				$("#page-title").text( "SMBVT - No narration title");

				//change title in MY NARRATIVES menu
				$(".activeMenu a").text(titlecase(narra.items[narra.subjectID].enName));

				narra.info.name = titlecase(narra.items[narra.subjectID].enName);

			// after a title modification, title will be this title
			} else {

				$("#bigName").text(resp.title);

				$("#page-title").text( "SMBVT - " +  resp.title);

				//change title in MY NARRATIVES menu
				$(".activeMenu a").text(resp.title);

				narra.info.name = resp.title;

			}

		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);

		}
	});
	
}

// modify subject title (of wikidata or previously modified) of a narration with another
function insertTitle(){
	
	// get title from popup input
	var title= $("#newBigTitle").val();
	
	$.ajax({
		type: "POST",
		url: "PHP//narrationTitle.php",
		dataType: "JSON",
		data: {dbusername: narra.user +'-'+narra.dbName, newtitle: title, idNarra: narra.id_n },
		success: function() {

			updateTitle();

		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);

		}
	});

}

function confirmUpdateTitle(){
			
	var currentTitle = $("#bigName").text();
	var inputTitle= "<input type='text' id='newBigTitle' value='"+currentTitle+"'>";

	showModal(
		"Update title",
		"Insert new title: </br></br>" + inputTitle,
		"Back",
		"Confirm",
		function() {
		},
		function() {
			insertTitle();
		}
	);

}

// Update interface language
function setLang(fast) {
    updateTitle();

	var inputHelp = $("#inputHelp");

    if (narra.currentLang === "en") {
        $("#entitiesLabel").text("ENTITIES");
        $("#saveButton span").text("SAVE");
        $("#cancelButton span").text("CLEAR");
        $("#allButton span").text("ALL");
        $("#peopleButton span").text("PEOPLE");
        $("#organizationButton span").text("ORGS");
        $("#conceptButton span").text("CONCEPTS");
        $("#objectButton span").text("OBJECTS");
        $("#placeButton span").text("PLACES");
        $("#workButton span").text("WORKS");
        $("#searchButton span").text("SEARCH");
        $("#loadBibButton").text("LOAD BIB");
        $("#exportButton span").text("EXPORT");
        $("#plusButton span").text("NEW");
        $("#relButton span").text("RELATIONS");
        $("#datePickerStart").find("label").text("START DATE");
        $("#datePickerEnd").find("label").text("END DATE");
        $("#event-source-div").find("label").text("EVENT SOURCE");
        $("#descDiv").find("label").text("DESCRIPTION");
        $("#digobjDiv").find("label").text("DIGITAL OBJECTS");
        $("#typeDiv").find("label").text("EVENT TYPE");
        inputHelp.text("Drop entities here!");
    } else if (narra.currentLang === "it") {
        $("#entitiesLabel").text("ENTITÀ");
        $("#saveButton span").text("SALVA");
        $("#cancelButton span").text("CANCELLA");
        $("#allButton span").text("TUTTE");
        $("#peopleButton span").text("PERSONE");
        $("#organizationButton span").text("ORGANIZZ.");
        $("#conceptButton span").text("CONCETTI");
        $("#objectButton span").text("OGGETTI");
        $("#placeButton span").text("LUOGHI");
        $("#workButton span").text("OPERE");
        $("#searchButton span").text("CERCA");
        $("#loadBibButton").text("CARICA BIB");
        $("#exportButton span").text("ESPORTA");
        $("#plusButton span").text("NUOVA");
        $("#relButton span").text("RELAZIONI");
        $("#datePickerStart").find("label").text("DATA INIZIO");
        $("#datePickerEnd").find("label").text("DATA FINE");
        $("#event-source-div").find("label").text("NOTE");
        $("#descDiv").find("label").text("DESCRIZIONE");
        $("#digobjDiv").find("label").text("OGGETTI DIGITALI");
        $("#typeDiv").find("label").text("TIPO EVENTO");
        inputHelp.text("Trascina le entità qui!");
    }
    inputHelp.show();
    $("#controls .data[data-class='event']").remove();
    $("#eventTitle", "#typeInput", "#topicInput", ".dateInput, .twitter-typeahead").focus(function () {
        $(this).parents('.form-group, .form-inline').removeClass("has-error");
    });

    if (!fast) {
        updateEventTypes();
        updateDataLang();
    }
}

// Get items by language (for event types)
function itemsByLang($items) {
    var results = [];
    $items.each(
        function () {
            results.push(this[narra.currentLang]);
        }
    );
    return results;
}

// Update list of event types
function updateEventTypes() {
	var typeInput = $("#typeInput");
    typeInput.val("");
    typeInput.typeahead("destroy");
    typeInput.typeahead(
        {
            minLength: 0,
            hint: false
        },
        {
            name: 'types',
            limit: 20,
            source: substringMatcher(narra.eventTypes, narra.currentLang),
            display: function(obj) {return obj[narra.currentLang]},
        }
    )
    .bind("typeahead:select", function (ignore, suggestion) {
        typeInput.blur();
        for (var i = 0; i < narra.eventTypes.length; i += 1) {
            if (narra.eventTypes[i][narra.currentLang] === suggestion[narra.currentLang]) {
                $(".roleSelect").each(function() {
                    $(this).replaceWith(makeRoleSelect($(this).attr("data-id")));
                });
                break;
            }
        }
    });
}

// Delete a specific entity
function deleteEntity(qid) {
    var title = narra.items[qid][narra.currentLang + "Name"];
    showModal(
        "Delete Entity",
        "Are you sure you want to delete the entity \"" + title + "\"?",
        "Keep Entity",
        "Delete Entity",
        function() {
        },
        function() {
            // Delete entity from workspace
            $("[data-id=" + qid + "]").remove();
        
            // Delete entity from entity list
            delete narra.items[qid];
        
            // Delete entity from database
            deleteObjectFromDB(qid);

            // Hide popover after deletion
            $('.popover').hide();
        }
    );
}

// Delete object from database
function deleteObjectFromDB(objID) {
	
	$.ajax({
		type: "POST",
		url: "PHP//deleteDb.php",
		dataType: "JSON",
		data: {objId: objID, dbname: narra.dbName, dbuser:narra.user, dbIdNarra: narra.id_n},
		success: function(resp) {
			console.log(resp.msg);
		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);
		}
	});

}

// Delete a specific event
function deleteEvent(evid) {
    var title = narra.events[evid].title;
    showModal(
        "Delete Event",
        "Are you sure you want to delete the event \"" + title + "\"?",
        "Keep Event",
        "Delete Event",
        function() {
        },
        function() {
            // Delete event from timeline
            $("#" + evid).remove();

            // Delete event from event list
            delete narra.events[evid];

            // Delete event from database
            deleteObjectFromDB(evid);

			// fix position of events after delete
			fixPositionAfterSwitch();

			// recreate html select without deleted event
			createHTMLSelect();

            fadeout('delete-event');
        }
    );
}

// Save object to database
function saveObjectToDB(objList, objID) {

 	$.ajax({
		type: "POST",
		url: "PHP//insertDb.php",
		dataType: "JSON",
		data: {objclist: JSON.stringify(objList[objID]), objcid:objID, dbname: narra.dbName, dbuser:narra.user, idNarra: narra.id_n},
		success: function(resp) {
			console.log(resp.msg);

		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);

		}

	});

}

// Save object to database
function forceSaveObjectToDB(objList, objID) {

 	$.ajax({
		type: "POST",
		url: "PHP//insertDb.php",
		dataType: "JSON",
		data: {objclist: JSON.stringify(objList[objID]), objcid:objID, dbname: narra.dbName, dbuser:narra.user, idNarra: narra.id_n},
		success: function(resp) {
			console.log(resp.msg);
		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);
		}

	});

}

function objectEquals(x, y) {
	'use strict';

	if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
	// after this just checking type of one would be enough
	if (x.constructor !== y.constructor) { return false; }
	// if they are functions, they should exactly refer to same one (because of closures)
	if (x instanceof Function) { return x === y; }
	// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
	if (x instanceof RegExp) { return x === y; }
	if (x === y || x.valueOf() === y.valueOf()) { return true; }
	if (Array.isArray(x) && x.length !== y.length) { return false; }

	// if they are dates, they must had equal valueOf
	if (x instanceof Date) { return false; }

	// if they are strictly equal, they both need to be an object at least
	if (!(x instanceof Object)) { return false; }
	if (!(y instanceof Object)) { return false; }

	// recursive object equality check
	var p = Object.keys(x);
	return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
		p.every(function (i) { return objectEquals(x[i], y[i]); });
}

// Check if there are changes from last save, in order to not confuse the user with useless modals
function checkChangesFromLastSave(a1, a2) {
    return objectEquals(a1, a2);
}

// clean all red input with has-error class
function clearAllHasError(eventTitle, dateInputStart, dateInputEnd, latitud, longitud, polygonArea, inputDiv, idText, numberText, eventVideoSelector) {
	$("#positionEvent").parents('.form-group, .form-inline').removeClass("has-error");
	eventTitle.parents('.form-group, .form-inline').removeClass("has-error");
	dateInputStart.removeClass("has-error-date");
	dateInputEnd.removeClass("has-error-date");
	latitud.removeClass("has-error-coors");
	longitud.removeClass("has-error-coors");
	polygonArea.removeClass("has-error-coors");
	inputDiv.parents('.form-control').removeClass("has-error");
	inputDiv.removeClass("has-error-input-div");
	$('.radioCoorsLabel').removeClass("has-error-coors");
	idText.removeClass('has-error-sketch');
	numberText.removeClass('has-error-sketch');
	eventVideoSelector.parent('.video-label-group').removeClass('has-error');
}

// Save event from creation form to database
function saveEvent(data, defaultEvent=false) {

    try {

		function isFloat(value) {
			return /\d+\.\d+/.test(value);
		}

        var evid = $("#workspace").attr("data-evid");

		// if a new event is saved after window.onload
        if (!evid) {
			evid = nextEvid();
		}

		var nothingChanged = true;

        if (data == undefined) {

            // Control input send by user
            var missingData = false;
            var props = {};
			var positionAfter = $('#positionAfter');
			var positionBefore = $('#positionBefore');
			var eventTitle = $("#eventTitle");
			var dateInputEnd = $("#dateInputEnd");
			var dateInputStart = $("#dateInputStart");
			var latitud = $("#latitud");
			var longitud = $("#longitud");
			var polygonArea = $("#polygonArea");
			var typeInput = $("#typeInput");
			var inputDiv = $("#inputDiv");
			var eventVideoSelector = $("#eventVideo");
			var idText = $("#id-text");
			var numberText = $("#number-text");

            if (positionAfter.is(':checked') || positionBefore.is(':checked')) {
                if ($('#positionEvent option').filter(':selected').val() == "empty") {
                    $("#positionEvent").parents('.form-group, .form-inline').addClass("has-error");
                    missingData = true;
                }
            }

            if (!eventTitle.val()) {
                eventTitle.parents('.form-group, .form-inline').addClass("has-error");
                missingData = true;
            }

            if (!dateInputEnd.val()) {
                dateInputEnd.val(dateInputStart.val());
            }
			if (!dateIsValid(dateInputStart.val()) && dateInputStart.val() != '') {
                dateInputStart.addClass("has-error-date");
                missingData = true;
            }
			if (!dateIsValid(dateInputEnd.val(), true) && dateInputEnd.val() != '') {
                dateInputEnd.addClass("has-error-date");
                missingData = true;
            }

			if (!typeInput.val()) {
				typeInput.val("no type");
			}

			var coorsType = $("input:radio[name='coors-type']:checked");

			// set missingData = true if point radio button is selected and one among latitud and longitud is missing, or it is not a float or a number
			if (coorsType.val() == 'point') {
				if (!latitud.val().trim() || !isFloat(latitud.val().trim()) || isNaN(latitud.val().trim())) {
					latitud.addClass("has-error-coors");
					missingData = true;
				}
				if (!longitud.val().trim() || !isFloat(longitud.val().trim()) || isNaN(longitud.val().trim())) {
					longitud.addClass("has-error-coors");
					missingData = true;
				}
			}
			if (coorsType.val() == 'pol' && !polygonArea.val().trim()) {
				// if polygon button is selected and polygonArea value is missing
				polygonArea.addClass("has-error-coors");
				missingData = true;
			}

            if (inputDiv.find(".data").length === 0) {
                inputDiv.parents('.form-control').addClass("has-error");
                inputDiv.addClass("has-error-input-div");
                missingData = true;
            }

			// check if neither the polygon nor the point radio buttons are selected
			if (!$("input:radio[name='coors-type']").is(":checked") && (formType == 'map')) {
				$('.radioCoorsLabel').addClass("has-error-coors");
				missingData = true;
			}

			if (formType == 'sketchfab') {
				if (!idText.val()) {
					idText.addClass('has-error-sketch');
					missingData = true;
				}
				if (!numberText.val()) {
					numberText.addClass('has-error-sketch');
					missingData = true;
				}
			}

			// check if video URL contains the root address instead of a tiny URL
			var videoURL = eventVideoSelector.val();
			var videoRadio = $("#video-radio");
			if (videoURL.indexOf('https://www.youtube.com/watch?') == -1 && videoRadio.is(':checked')) {
				eventVideoSelector.parent('.video-label-group').addClass('has-error');
				missingData = true;
			}

            if (missingData) {
                fadeout('failed-form', 1000);
                return undefined;
            }

			// check the length of digObj, if == 1 display a message about backwards compatibility
			// old versions have an array of 1 element whereas actual version has more elements or 0
			var digobjs = makeDigObjArray();
			if (digobjs.length == 1 && typeof digobjs[0] === "string") {
				fadeout('old-digobj-warning', 2500);
				return undefined;
			}

			$("#inputDiv .data").each(function () {
				var radioFilterValue = '';
				var thisId = $(this).attr("data-id");
				if ($(this).attr("aria-describedby") === undefined) {
					props[thisId] = narra.events[evid].props[thisId];
					props[thisId].showOnMap = narra.events[evid].props[thisId].showOnMap;

				} else {
					var $popover = $("#" + $(this).attr("aria-describedby"));

					// get map visual filter
					radioFilterValue = $popover.find(".radioButtons:checked").val();

					// find correct value of role
					var role;
					if ($(".roleInput").hasClass("hidden")) {
						role = $popover.find(".roleSelect").val();
					} else {
						role = $popover.find(".roleInput").val();
					}

					// save prop
					props[thisId] = {
						"title": $popover.find("span").first().text(),
						"class": $(this).attr("data-class"),
						"role": role,
						"description": $popover.find(".descArea").val(),
						"notes": $popover.find(".event-source").val()
					}

					var eventExists = evid in narra.events;

					if (!(eventExists) || !(thisId in narra.events[evid].props)) {
						nothingChanged = false;
					} else if (eventExists && (radioFilterValue !== narra.events[evid].props[thisId].showOnMap)) {
						nothingChanged = false;
					}

					props[thisId].showOnMap = radioFilterValue;

					// Remove undefined properties
					props[thisId] = Object.fromEntries(Object.entries(props[thisId]).filter(([_, v]) => v !== undefined));

				}

			});

			// get map markers colors
			var mapColor = makeMapColor(typeInput);

			// get background image and image(s) or video
			var [imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideo, eventVideoCaption] =
				getImagesAndVideo(evid, imageButton, eventBackImg, eventMedia, eventMediaCaption, eventVideoSelector, eventVideo, eventVideoCaption, videoRadio, true, nothingChanged);

			// get coordinates
			var [polygon, lat, long] = getCoords(polygonArea, polygon, lat, long, latitud, longitud);

			// get the position of the event in the narrative
			var position = getPosition(positionAfter, positionBefore, evid);
			var temp;

            // if is a NEW event
            if (narra.events[evid] == undefined) {

				// check if there is a formType value, otherwise set it to 'map'
				if (formType == '') {
					formType = "map";
				}

				temp = makeTemp(evid, eventTitle, dateInputStart, dateInputEnd, typeInput, eventBackImg, props, lat, long, polygon, eventVideo, eventVideoCaption, eventMedia,
					eventMediaCaption, position, mapColor, formType, idText, numberText);

				narra.events[evid] = temp;

				// Save event to PouchDB database
				saveObjectToDB(narra.events, evid);

				$(".popover").hide();

				// markerColorMap default
				$("#markerMapColor").val("#a5a5a5");


				// fix order of events position
				fixPositionAfterSwitch();

				// create select for position with new title
				createHTMLSelect();

				clearAllHasError(eventTitle, dateInputStart, dateInputEnd, latitud, longitud, polygonArea, inputDiv, idText, numberText, eventVideoSelector);

				fadeout('saved-form');

				return evid;

			// if we MODIFY an event
			} else {

				// check if event has a type, that is an event before the types division - backwards compatibility
				if (narra.events[evid]["formType"] === undefined) {
					formType = "map";
				} else {
					formType = narra.events[evid]["formType"];
				}

				temp = makeTemp(evid, eventTitle, dateInputStart, dateInputEnd, typeInput, eventBackImg, props, lat, long, polygon, eventVideo, eventVideoCaption, eventMedia,
					eventMediaCaption, position, mapColor, formType, idText, numberText);

				var event = narra.events[evid];
				// delete in case the delta is only the revision version of the event
				if (typeof temp._rev === 'undefined') {
					delete temp._rev;
				}

				// section for events that have different properties
				manageDifferentProperties(event, temp);

				if ((!checkChangesFromLastSave(event, temp)) || (!nothingChanged)) {
					nothingChanged = false;
					narra.events[evid] = temp;
					$(".eventMedia").each(function () {
						imageButton = $(this).parent().siblings('div.button-image-div').children('button.selectEventLocalImage').text('Upload image');
					});
				} else {
					// remove red borders from date inputs, if there are any
					dateInputEnd.parents('.form-group, .form-inline').removeClass("has-error");
				}
			}
        } else {
            narra.events[evid] = data;
            narra.events[evid]._id = evid;
        }


        if (!nothingChanged) {

            // Save event to PouchDB database
            saveObjectToDB(narra.events, evid);

			$(".popover").remove();

            // markerColorMap default
            $("#markerMapColor").val("#a5a5a5");

            // fix order of events position
            fixPositionAfterSwitch();

            // create select for position with new title
            createHTMLSelect();

			if (narra.currentLang === "en") {
				inputDiv.empty().css("vertical-align", "middle");
			} else if (narra.currentLang === "it") {
				inputDiv.empty().css("vertical-align", "middle");
			}

			var itemsToAdd = [];
			for (var prop in narra.events[evid].props) {
				(function (){
					if (prop in narra.items && $("#inputDiv .data[data-id=" + prop + "]").length === 0) {
						try {
							var $drag = $(makeDataDiv(prop));
							makeDraggable($drag);
							addPopoverTo($drag, true, evid);
							$drag.mousedown(
								function () {
									$(".popover:not([attr=" + $drag.attr("data-id") + "])").hide();
								}
							);
							itemsToAdd.push($drag);
						} catch (e) {
							console.log(currentTime() + "TypeError: " + e + " " + narra.items[prop]);
						}
					}
				})();
			}
			itemsToAdd.sort(sortByClass);
			$(itemsToAdd).each(function ($i, $item){$("#inputDiv").append($item); updateDataText($item, narra.currentLang);});

            fadeout('saved-form');

        } else if (!defaultEvent) {  // prevent defaultEvents() to display this alert
            fadeout("nothing-changed");
        }

		clearAllHasError(eventTitle, dateInputStart, dateInputEnd, latitud, longitud, polygonArea, inputDiv, idText, numberText, eventVideoSelector);

        return evid;

    } catch (error) {
        console.error("An error occurred while saving the event:", error);
        fadeout('failed-form', 1000);
    }
}

function fadeout(id, time=1000) {
    var fade = document.getElementById(id);

    fade.style.display = "block";
    fade.style.opacity = 1;
    setTimeout(function(){
        var intervalID = setInterval(function () {

            if (!fade.style.opacity) {
                fade.style.opacity = 1;
            }


            if (fade.style.opacity > 0) {
                fade.style.opacity -= 0.1;
            }

            else {
                clearInterval(intervalID);
                fade.style.display = "none";
            }

        }, 100);
    }, time);
}

//upload an image of an event
function uploadEventImg(localImage, eventId, imageNumber=null){

	//create and append file (image) and string name (idN+nameUser+idEvent.extension) to form
	var form_data = new FormData();

	form_data.append("file",localImage);
	if(imageNumber == null){
		form_data.append("imgName", narra.id_n +"-"+narra.user+"-"+eventId+"."+ localImage.type.split("/")[1]);
	} else {
		form_data.append("imgName", narra.id_n +"-"+narra.user+"-"+eventId+"-"+imageNumber+"."+ localImage.type.split("/")[1]);
	}
	console.log(localImage);
	for (var p of form_data) {
		console.log(p);
    }
	
	$.ajax({
        url: "PHP//uploadEventImage.php",
		type: "POST",
		data: form_data,
        cache: false,
        contentType: false,
        processData: false,
		success: function(resp) {
			console.log(resp);
		},
		error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

		}
		
	});
}


function displayAllEvents() {
    var timeline = document.createElement("div");
    timeline.setAttribute("id", "timeline");
    
    timeline.addEventListener("click", function() {
        $('.popover').hide();
    });
    
    Object.keys(narra.events).forEach(function (evid, ignore) {
        if (narra.events[evid] !== undefined) {
            var data = narra.events[evid];
            
            var eventDiv = document.createElement("div");
            eventDiv.setAttribute("id", evid);
            eventDiv.setAttribute("class", "timelineEvent");
            eventDiv.setAttribute("data-start", data["start"]);
            eventDiv.setAttribute("data-end", data["end"]);
			eventDiv.setAttribute("position", data["position"]);
            eventDiv.setAttribute("onscroll", "$('.popover').hide()");

            var deleteX = document.createElement("b");
            deleteX.setAttribute("class", "x");
            deleteX.textContent = "×";
                    
            var deleteButton = document.createElement("div");
            deleteButton.setAttribute("class", "deleteButton");
            deleteButton.appendChild(deleteX);
            
            var titleHeading = document.createElement("span");
            titleHeading.setAttribute("class", "titleHeading");
            titleHeading.textContent = data["title"];
            
            if (narra.events[evid]["formType"] != "sketchfab") {
                var dateHeading = document.createElement("h4");
                dateHeading.setAttribute("class", "dateHeading");
                dateHeading.textContent = dateInterval(data["start"], data["end"]);
            }
                        
            var fragment = document.createElement("div");
            
            for (var prop in data.props) {
				fragment.innerHTML = makeDataDiv(prop);
                var element = fragment.firstElementChild;
                if (element == null) {
                    console.log(currentTime() + "Entity not found: " + prop);
                }
            }
            
            eventDiv.appendChild(deleteButton);
            eventDiv.appendChild(titleHeading);
            if (narra.events[evid]["formType"] != "sketchfab") {
                eventDiv.appendChild(dateHeading);
                eventDiv.appendChild(dateHeading);
            }
                        
            deleteButton.addEventListener("click", function() {
                event.stopPropagation();
                deleteEvent(evid);
            });
            eventDiv.addEventListener("click", function() {
                confirmEventLoad(evid);
            });
            eventDiv.addEventListener("mouseenter", function() {
                $(this).find('.deleteButton').fadeToggle("fast");
            });
            eventDiv.addEventListener("mouseleave", function() {
                $(this).find('.deleteButton').fadeToggle("fast");
            });
            
            timeline.appendChild(eventDiv);
        }
    });
    
    //timeline = sortEvents(timeline);
	timeline = sortEventsByPosition(timeline);
    
    var container = document.getElementById("sidebar");
    container.replaceChild(timeline, document.getElementById("timeline"));
    
    return true;
}

// Display a specific event
function displayEvent(data, evid) {

	var position;

	// if we modify an event, get its position. Else increment position
	if (narra.events[evid] != undefined) {

		position = narra.events[evid].position;

	} else {

		position = nextEventPosition();

	}
		
    $("#" + evid).remove();
    if (evid === undefined) return false;

    // Create div representing the event
    var $eventDiv = $("<div class='timelineEvent'>")
    .attr("id", evid)
    .click(function (){confirmEventLoad($(this).attr("id"))})
    .append(
        $("<div class='deleteButton'>").append("<b class='x'>×</b>").click(function (e) {
            e.stopPropagation(); deleteEvent(evid);
        }),
        $("<span class='titleHeading'>"),
        $("<h4 class='dateHeading'>")
    );

	var dateInputStart = $("#dateInputStart");
	var dateInputEnd = $("#dateInputEnd");

    // If event was created by the user...
    if (data == undefined) {         //$eventDiv.find(".eventBottom").append($("#inputDiv").children().sort(sortByClass));
        $eventDiv.find(".titleHeading").text($("#eventTitle").val());    
        $eventDiv.find(".dateHeading").text(dateInterval(dateInputStart.val(), dateInputEnd.val()));
        if (formType != "sketchfab") {
            $eventDiv.attr("data-start", dateFromString(dateInputStart.val(), false));
            $eventDiv.attr("data-end", dateFromString(dateInputEnd.val(), false));
        }
		
		$eventDiv.attr("position", position);

    }
    // if event was a default one...
    else {
        $eventDiv.find(".titleHeading").html(data["title"]);
        var props = data.props;
        for (var prop in props) {
            $(makeDataDiv(prop, function (data, evid) {displayEvent(data, evid)}));
        }
        if (data["start"] != data["end"]) $eventDiv.find("h4").text(data["start"] + " – " + data["end"]);
        else $eventDiv.find(".dateHeading").text(dateInterval(data["start"], data["end"]));
        $eventDiv.attr("data-start", data["start"]);
        $eventDiv.attr("data-end", data["end"]);
		$eventDiv.attr("position", data["position"]);
    }

    $("#ev" + evid).remove();
    $("#timeline").append($eventDiv);
    $eventDiv.find(".data").each(function () {
        updateDataText($(this), narra.currentLang);
    });
    $eventDiv.mouseenter(function () { $(this).find(".deleteButton").fadeToggle("fast") });
    $eventDiv.mouseleave(function () { $(this).find(".deleteButton").fadeToggle("fast") });

	sortEventsByPosition();

    return true;
}

// Create string representing a date interval
function dateInterval(start, end) {
    start = dateFromString(start, true);
    end = dateFromString(end, true);
    if (start != end) return start + " – " + end;
    else return start;
}

// Fix buggy JavaScript parsing of dates
function fixYear(date, year) {
    date.setFullYear(year);
    return date;
}

// Parse string, array, or number to date object
function parseDate(d) {
    
    // Split string to array
    if (d.constructor === String) {
        d = d.split('-');
    }
    
    // Fix array for negative date and missing elements
    if (d.constructor === Array) {
        if (d[0] === "") {
            d = d.splice(1);
            d[0] = '-' + d[0];
        }
        if (d.length === 1) {
            d[1] = 1;
        }
        if (d.length === 2) {
            d[2] = 1;
        }
    }

    // Make date from array or number
    return (
        d.constructor === Date ? d :
        d.constructor === Array ? fixYear(new Date(d[0], d[1]-1, d[2]), d[0]) :
        d.constructor === Number ? fixYear(new Date(d, 0, 1), d) :
        typeof d === "object" ? new Date(d.year,d.month,d.date) :
        NaN
    );
}

// Compare two dates for sorting
function compareDates(a, b) {
    return (
        isFinite(a = parseDate(a).valueOf()) &&
        isFinite(b = parseDate(b).valueOf()) ?
        (a > b) - (a < b) :
        NaN
    );
}

// Sort events based on their ID
function sortEvents(timeline) {    
    var sort_by_time = function (a, b) {
        var compare = compareDates(a.getAttribute("data-start"), b.getAttribute("data-start"));
        if (compare === 0) return a.getAttribute("id").localeCompare(b.getAttribute("id"));
        else return compare;
    }
    
    if (timeline === undefined) {
        timeline = document.getElementById("timeline");
    }
    var items = timeline.childNodes;
        
    var list = [];
	var i;
    for (i in items) {
        if (items[i].nodeType === 1) {
            list.push(items[i]);
        }
    }
    list.sort(sort_by_time);
        
    for (i = 0; i < list.length; i++) {
        timeline.appendChild(list[i]);
    }
    return timeline;
}

// Sort events based on position
function sortEventsByPosition(timeline) {
    var sort_by_position = function (a, b) {
		a = a.getAttribute("position");
		b = b.getAttribute("position");
		return a.localeCompare(b, 'en', {numeric: true});
    }
    
    if (timeline === undefined) {
        timeline = document.getElementById("timeline");
    }
    var items = timeline.childNodes;
        
    var list = [];
	var i;
    for (i in items) {
        if (items[i].nodeType === 1) {
            list.push(items[i]);
        }
    }
    list.sort(sort_by_position);
    for (i = 0; i < list.length; i++) {
        timeline.appendChild(list[i]);
    }
    return timeline;
} 
 

// Select next event ID
function nextEvid() {
    var max = 0;
    for (var key in narra.events) {
        var numPart = parseInt(key.split("ev")[1]);
        if (numPart > max) max = numPart;
    }
    var next = new Date().getTime() + Math.floor(Math.random() * 10000000);
    return("ev" + next.toString());
}

// Convert date string to well-formed date
function dateFromString(string, yearLast) {
    string = string.toString();
    if (string !== undefined) {
        var date;
        var splits = [];
        if (splits.length < 2) splits = string.split("-");
        if (splits.length < 2) splits = string.split("/");
        if (splits.length < 2) splits = string.split(".");
        for (var i = 0; i < splits.length; i++) {
            if (splits[i] && splits[i].length < 2) splits[i] = "0" + splits[i];
        }
        if (!yearLast && splits.indexOf(Math.max.apply(this, splits).toString()) === 2) date = splits.reverse().join("-");
        else if (yearLast && splits.indexOf(Math.max.apply(this, splits).toString()) === 0) date = splits.reverse().join("-");
        else date = splits.join("-");
        return date;
    }
    return "";
}

function incorrectFormatDate(dateInput) {
	// check if string has the format with day, month and year separated by '-' or only the year
	var regex_dd_mm_yyyy = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{1,4}$/;
	var regex_yyyy = /^\d{1,4}$/;
	var regex_mm_dd_yyyy = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{1,4}$/;
	var regex_negative_yyyy = /^-\d{1,4}$/;
	var regex_yyyy_mm_dd = /^\d{1,4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
	var regex_yyyy_dd_mm = /^\d{1,4}-(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/;

	return !regex_dd_mm_yyyy.test(dateInput) && !regex_yyyy.test(dateInput) && !regex_mm_dd_yyyy.test(dateInput) && !regex_negative_yyyy.test(dateInput) && !regex_yyyy_mm_dd.test(dateInput) && !regex_yyyy_dd_mm.test(dateInput);
}

// Check if date is valid
function dateIsValid(date, checkConsistency=false) {
    date = dateFromString(date, false);
    if (!isNaN(Date.parse(date))) {
		if (incorrectFormatDate(date)) {
			return false;
		}
	} else {
		return false;
	}
	return !(checkConsistency && !checkTemporalConsistency(date));
}

function checkTemporalConsistency(dateEnd) {
	var dateStart = dateFromString($("#dateInputStart").val(), false);
	return dateEnd >= dateStart;
}

// Load default events
function defaultEvents() {
    var subj = narra.items[narra.subjectID];
    
    if (subj === undefined) return false;

	var props;
	var data;
    var evid;
	var url;
	var queryOSM;
	var date;

    // Birth
    if ("birth" in subj) {
        props = {};
        props[narra.subjectID] = {"class": "person", "role": "child"};

        if ("father" in subj) props[subj.father] = {"class": "person", "role": "father"};
        if ("mother" in subj) props[subj.mother] = {"class": "person", "role": "mother"};
        if ("birthPlace" in subj) props[subj.birthPlace] = {"class": "place"};

        data = {
            "title": "Birth of " + subj["enName"],
            "itTitle": "Nascita di " + subj["itName"],
            "start": subj.birth,
            "end": subj.birth,
            //"type": "birth",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
		
    }

    // Death
    if ("death" in subj) {
        props = {};
        props[narra.subjectID] = {"class": "person", "role": "dead"};

        if ("deathPlace" in subj) props[subj.deathPlace] = {"class": "place"};

        data = {
            "title": "Death of " + subj["enName"],
            "itTitle": "Morte di " + subj["itName"],
            "start": subj.death,
            "end": subj.death,
            //"type": "death",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
    }

    // Marriage
    if ("spouse" in subj && "marriageDate" in subj) {
        date = subj.marriageDate.replace("+", "").split("T")[0].split("-01-01")[0];

        props = {};
        props[narra.subjectID] = {"class": "person", "role": "spouse"};

        if ("spouse" in subj) props[subj.spouse] = {"class": "person", "role": "spouse"};
        if ("marriagePlace" in subj) props[subj.marriagePlace] = {"class": "place"};

        data = {
            "title": "Marriage of " + subj["enName"],
            "itTitle": "Matrimonio di " + subj["itName"],
            "start": date,
            "end": date,
            //"type": "marriage",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
    }

    // Foundation
    if ("foundation" in subj) {
        console.log(currentTime() + "Creating foundation event");

        date = subj.foundation.replace("+", "").split("T")[0].split("-01-01")[0];

        props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        data = {
            "title": "Foundation of " + subj["enName"],
            "itTitle": "Fondazione di " + subj["itName"],
            "start": date,
            "end": date,
            //"type": "foundation",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
    }
    
    if ("foundation2" in subj) {
        console.log(currentTime() + "Creating foundation event");

        date = subj.foundation2.replace("+", "").split("T")[0].split("-01-01")[0];

        props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        data = {
            "title": "Foundation of " + subj["enName"],
            "itTitle": "Fondazione di " + subj["itName"],
            "start": date,
            "end": date,
            //"type": "foundation",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
    }

    // Completion
    if ("completion" in subj) {
        console.log(currentTime() + "Creating completion event");

        date = subj.completion.replace("+", "").split("T")[0].split("-01-01")[0];

        props = {};
        props[narra.subjectID] = {"class": typeFromArray(narra.items[narra.subjectID].type)};

        data = {
            "title": "Completion of " + subj["enName"],
            "itTitle": "Completamento di " + subj["itName"],
            "start": date,
            "end": date,
            //"type": "completion",
			"type": "no type",
            "props": props,
			"position": nextEventPosition(),
			"description": "",
			"backgroundImg": "",
			"objurl": "",
			"source": "",
			"eventMedia" : "",
			"eventMediaCaption" : "",
			"eventVideo": "",
			"eventVideoCaption": "",
			"formType": "slide"
        };
        evid = saveEvent(data, true);
        if (evid) displayEvent(data, evid);
		
		// query OSM to add Polygon if exist
		for (let qidK in props) {
			if (props[qidK].class === "place") {
				if (narra.items[qidK].coordinatesPolygon == undefined || narra.items[qidK].coordinatesPolygon == "") {
					url= "https://tool.dlnarratives.eu/fuseki/narratives/query?query=";
					queryOSM= url + encodeURIComponent("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX osm: <https://www.openstreetmap.org/> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX osm2rdfkey: <https://osm2rdf.cs.uni-freiburg.de/rdf/key#> SELECT ?wkt WHERE { SERVICE <https://qlever.cs.uni-freiburg.de/api/osm-planet> { ?osm_id osm2rdfkey:wikidata wd:"+ qidK +" . ?osm_id geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt . } }");

					$.getJSON(queryOSM, function(data) {
						
						if (data.results.bindings.length > 0) {
							narra.items[qidK].coordinatesPolygon = data.results.bindings[0].wkt.value;
							saveObjectToDB(narra.items, qidK);
						}
					
					}).fail(function() { console.log("OSM Query error"); });
				}
			}
		}
    }
}

function workspaceIsEmpty() {

	var eventMedia = $(".eventMedia");

	// if there are no more than one image section simply check all fields...
	if (eventMedia.length < 2) {

		if ($("#eventTitle").val().trim() || $("#dateInputStart").val().trim() || $("#dateInputEnd").val().trim() || $("#typeInput").val().trim() || $("#inputDiv").find(".data").length > 0 || $("#descArea").val().trim() || $("#eventVideo").val().trim() || $("#eventVideoCaption").val().trim() || $("#eventMedia").val().trim() || $("#eventMediaCaption").val().trim() || $("#event-source").val().trim() || $("#digobjInput").val().trim()) return false;

	} else {
		// ...otherwise check media and caption of each section, plus all other fields

		var valueFound = false;

		if ($("#eventTitle").val().trim() || $("#dateInputStart").val().trim() || $("#dateInputEnd").val().trim() || $("#typeInput").val().trim() || $("#inputDiv").find(".data").length > 0 || $("#descArea").val().trim() || $("#event-source").val().trim() || $("#digobjInput").val().trim()) return false;

		eventMedia.each(function () {
			if ($(this).val().trim()) {
				valueFound = true;
			}
		});
		$(".eventMediaCaption").each(function () {
			if ($(this).val().trim()) {
				valueFound = true;
			}
		});

		if (valueFound) {
			return false;
		}

	}

	 return true;

}

function confirmEventLoad(evid) {
    if ((!workspaceIsEmpty()) && (!checkNewChanges())) {
        showModal(
            "Load event",
            "If you load this event you will lose the event information that you have inserted.\nAre you sure to proceed?",
            "Cancel",
            "Load event",
            function() {
            },
            function() {
                resetWorkspace();
                loadEvent(evid);
                fadeout('load-event');
            }
        );
    }
    else {
        resetWorkspace();
        loadEvent(evid);
        fadeout('load-event');
    }
}

// Load event from timeline to event form
function loadEvent(evid) {

	// check new properties, mainly thought for old events - backwards compatibility
	if (narra.events[evid]["polygon"] === undefined) {
        narra.events[evid]["polygon"] = "";
    }

    if (narra.events[evid]["formType"] === undefined) {

		if (((narra.events[evid]["latitud"] != "") || (narra.events[evid]["longitud"] != "")) || ((narra.events[evid]["polygon"] != ""))) {
			formType = "map";
		} else {
			formType = "slide";
		}

		narra.events[evid]["formType"] = formType;

    } else {
        formType = narra.events[evid]["formType"];
    }

    // hide this title event from position <select>
	$('.optionSel').show();
	$('#optionSel' + evid).hide();

	$(".popover").remove();
	
    $('#eventTitle').attr("placeholder", "");
    updateEventTypes();
    $("#workspace").attr("data-evid", evid);

    loadEventType(formType, true, true);

	var addButton = $("#addButton");
	var inputDiv = $("#inputDiv");

	// remove active class from New Event button if it was selected previously
	if (addButton.hasClass("add-button-active")) {
		addButton.toggleClass("add-button-active");
	}

    inputDiv.empty();
    inputDiv.css("vertical-align", "top");
    $("#eventTitle").val(narra.events[evid]["title"]);
    $(".dateInput").css("color", "#555");

	$("#dateInputStart").val(dateFromString(narra.events[evid]["start"], true));
	$("#dateInputEnd").val(dateFromString(narra.events[evid]["end"], true));

    $("#typeInput").val(narra.events[evid]["type"]);
    $("#topicInput").val(narra.events[evid]["topic"]);
    $("#descArea").val(narra.events[evid]["description"]);
	$("#backImgArea").val(narra.events[evid]["backgroundImg"]);
    $("#event-source").val(narra.events[evid]["source"]);

	$("#latitud").val(narra.events[evid]["latitud"]);
	$("#longitud").val(narra.events[evid]["longitud"]);  
	$("#polygonArea").val(narra.events[evid]["polygon"]);
	$("#placeLabel").val(narra.events[evid]["eventPlaceLabel"]);

	if (narra.events[evid]["formType"] == "map") {
		// if there is at least a value between latitude and longitude load these values and display them
		if ((narra.events[evid]["latitud"] != "") || (narra.events[evid]["longitud"] != "")) {
			$("#coors-map").css("display", "flex");
			$("#point-radio").prop("checked", true);
		} else {
			$("#coors-map").css("display", "none");
		}

		// if there is a value in 'polygon' load that value and display it
		if (narra.events[evid]["polygon"] != "") {
			$("#polygon").css("display", "flex");
			$("#polygon-radio").prop("checked", true);
		} else {
			$("#polygon").css("display", "none");
		}
	}

	// check if event is older - backwards compatibility
	if (!narra.events[evid].hasOwnProperty('eventVideo')) {
		narra.events[evid].eventVideo = "";
		narra.events[evid].eventVideoCaption = "";
	}

	$("#eventVideo").val(narra.events[evid]["eventVideo"]);
	$("#eventVideoCaption").val(narra.events[evid]["eventVideoCaption"]);

	// if there is at least a value between eventVideo (URL) and eventVideoCaption load these values and display them
	if ((narra.events[evid]["eventVideo"] != "") || (narra.events[evid]["eventVideoCaption"] != "")) {
		$("#video-caption-group").css("display", "block");
		$("#video-radio").prop("checked", true);
	} else {
		$("#video-caption-group").css("display", "none");
	}

	// if there is at least a value between eventMedia and eventMediaCaption...
	if ((narra.events[evid]["eventMedia"] != "") || (narra.events[evid]["eventMediaCaption"] != "")) {
		// ...check if there is only one image (a string)
		if (typeof narra.events[evid]["eventMedia"] === "string") {
			$("#eventMedia").val(narra.events[evid]["eventMedia"]);
			$("#eventMediaCaption").val(narra.events[evid]["eventMediaCaption"]);
		} else {
			$("#eventMedia").val(narra.events[evid]["eventMedia"][0]);
			$("#eventMediaCaption").val(narra.events[evid]["eventMediaCaption"][0]);
			// load information for each saved image section
			for (i = 1; i < narra.events[evid]["eventMedia"].length; i++) {
				addImageGroup(true, narra.events[evid]["eventMedia"][i], narra.events[evid]["eventMediaCaption"][i]);
			}
		}

		// display all image sections and add-image button, plus set radio button checked
		$(".image-caption-group").each(function() {
			$(this).css("display", "table");
		});

		$("#add-image").css("display", "flex");
		$("#image-radio").prop("checked", true);
	}
	
	$("#markerMapColor").val(narra.events[evid]["mapMarkerColor"]);

    $("#id-text").val(narra.events[evid]["sketchfabid"]);
    $("#number-text").val(narra.events[evid]["annotationNumber3DModel"]);
	
	// if digital object is array of objrcts (title + url)
    if ($.type(narra.events[evid]["objurl"]) === "array" && $.type(narra.events[evid]["objurl"][0]) === "object") {
		
		for (var i=0; i < narra.events[evid]["objurl"].length; i++) {
			var url = narra.events[evid]["objurl"][i].url;
			var title = narra.events[evid]["objurl"][i].title;
			addDigitalObject(url, title);
		}
    
	// if digital object are old (only array of URLs)
	} else if ($.type(narra.events[evid]["objurl"]) === "array") {

        $(narra.events[evid]["objurl"]).each(function() {
            addDigitalObject(this, "", true);
        });

    } else  if ($.type(narra.events[evid]["objurl"]) === "string") {
       
	   addDigitalObject(narra.events[evid]["objurl"], "", true);
    
	}
    
    var itemsToAdd = [];
    for (var prop in narra.events[evid].props) {
		(function (){
			if (prop in narra.items && $("#inputDiv .data[data-id=" + prop + "]").length === 0) {
				try {
					var $drag = $(makeDataDiv(prop));
					makeDraggable($drag);
					addPopoverTo($drag, true, evid);
					$drag.mousedown(
						function () {
							$(".popover:not([attr=" + $drag.attr("data-id") + "])").hide();
						}
					);
					itemsToAdd.push($drag);
				} catch (e) {
					console.log(currentTime() + "TypeError: " + e + " " + narra.items[prop]);
				}
			}
		})();
    }
    itemsToAdd.sort(sortByClass);
    $(itemsToAdd).each(function ($i, $item){$("#inputDiv").append($item); updateDataText($item, narra.currentLang);});

    // Adjust textarea height
    var textareas = document.getElementsByTagName('textarea');
    for (var elem of textareas) {
        setTextareaHeight(elem);
    }
	
	//show all events after click on one of them
	$("#eventSearch").val("");
	$("#timeline .timelineEvent").show();
	
}

// Get color of entity based on type
function getColor(type) {
    if (type != undefined) type = type.toLowerCase();
    if (type == "event") return "rgb(200, 255, 200)";
    if (type == "person") return "#dba2e7";
	if (type == "organization") return "#eda5bd";
    if (type == "object") return "#f5afa9";
	if (type == "concept") return "#ffe2df";
	if (type == "place") return "#f5c695";
    if (type == "work") return "#f2eb96";
    if (type == "other") return "rgb(255, 255, 255)";
}

// Get image for entity
function getImage(qid) {
    if (qid in narra.items && "image" in narra.items[qid]) {
        return narra.items[qid]["image"];
    }
    return "";
}

// Get label for entity
function getLabel(qid) {
    if (qid in narra.items) {
        return narra.items[qid][narra.currentLang + "Name"] || narra.items[qid][narra.otherLang + "Name"];
    }
    return "";
}

// Initial Wikipedia API request
function wikipediaRequest(url, lang, linksArray, subjectName) {

    var wikipediaURL = url != "" ? url : "https://" + lang + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(subjectName) +
    "&prop=redirects|pageprops&rawcontinue&generator=links&callback=?&redirects=&gpllimit=500&format=json";

    console.log(currentTime() + "Wikipedia request");
	console.log("URL wikipedia:     " + wikipediaURL);

    if (url.indexOf("pageimages") < 0) $.getJSON(wikipediaURL, function (links) {
		
		// if there are results in wikipedia in current language
		if ( Object.keys(links).length > 0 ) {
		
			if (narra.subjectID != "") {
				if (links.query !== undefined && links.query.pages !== undefined) {
					for (var property in links.query.pages) {
						linksArray.push(links.query.pages[property]);
					}
				}
				else {
					console.log(currentTime() + wikipediaURL);
				}
			}
			if ("query-continue" in links && "links" in links["query-continue"]) {
				url =     "https://" + lang + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(subjectName) +    "&prop=redirects|pageprops&rawcontinue&generator=links&callback=?&redirects=&gpllimit=500&format=json&gplcontinue=" + links["query-continue"]["links"]["gplcontinue"];
				wikipediaRequest(url, lang, linksArray, subjectName);
			}
			else {
				var qids = [];
				var i;

				for (i = 0; i < linksArray.length; i++) {
					if ("pageprops" in linksArray[i] && "wikibase_item" in linksArray[i]["pageprops"] && qids.indexOf(linksArray[i]["pageprops"]["wikibase_item"]) < 0) {
						qids.push(linksArray[i]["pageprops"]["wikibase_item"]);
					}
				}

				var lastRun = narra.counter + Math.floor(qids.length / 200) + 1;

				for (i = 0; i < qids.length; i += 200) {
					sparqlRequest(qids.slice(i, i + 200), lastRun, undefined, undefined, true);
				}
			}
		
		// search other language on Wikipedia if there aren't results in current language
		} else {
			console.log("0 results in Wikipedia " + lang + "; search in Wikipedia " +  narra.otherLang);
			wikipediaRequest(url, narra.otherLang, linksArray, subjectName);
			
		}

    });
}

// More detailed query for subject of narrative
var subjectQuery = "OPTIONAL { ?uri p:P26 ?marriage. ?marriage ps:P26 ?spouse. OPTIONAL{?marriage pq:P580 ?marriageDate.} OPTIONAL{?marriage pq:P2842 ?marriagePlace.}}\n" +
    "OPTIONAL { ?uri wdt:P25 ?mother. }\n" +
    "OPTIONAL { ?uri wdt:P22 ?father. }\n" +
    "OPTIONAL { ?uri wdt:P26 ?child. }\n" +
    "OPTIONAL { ?uri wdt:P40 ?sister. }\n" +
    "OPTIONAL { ?uri wdt:P7 ?brother. }\n" +
    "OPTIONAL { ?uri wdt:P19 ?birthPlace. }\n" +
    "OPTIONAL { ?uri wdt:P20 ?deathPlace. }\n";

var subjectExtract = " ?spouse ?marriageDate ?mother ?father ?child ?sister ?brother ?birthPlace ?deathPlace";

// Add role to global array of roles
function addRole(role) {
    if (role !== undefined && role.indexOf("entity/") > -1) {
        role = role.split("entity/")[1];
    }
    if (!(role in narra.roles)) {
        narra.roles[role] = {};
    }
    return role;
}

// Convert result of SPARQL query to JavaScript object
function sparqlToItem(item, force) {
    var qid = item["uri"]["value"].split("entity/")[1];
    var newItemsToLoad = [];

    if (!(qid in narra.items)) {

        var newItem = {};

        newItem._id = qid;
        newItem._rev = undefined;
        newItem.itName = "";
        newItem.enName = "";
        newItem.itDesc = "";
        newItem.enDesc = "";
        newItem.image = "";
        newItem.type = [];
        newItem.role = [];

        // Extract basic data from each entity
        if ("itName" in item) newItem["itName"] = item["itName"]["value"];
        if ("enName" in item) newItem["enName"] = item["enName"]["value"];
        if ("itDesc" in item) newItem["itDesc"] = item["itDesc"]["value"];
        if ("enDesc" in item) newItem["enDesc"] = item["enDesc"]["value"];
        if ("image" in item) newItem["image"] = item["image"]["value"];
		if ("coordinatesPoint" in item) newItem["coordinatesPoint"] = item["coordinatesPoint"]["value"];
        if ("birth" in item) newItem["birth"] = item["birth"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
        if ("death" in item) newItem["death"] = item["death"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
        if ("foundation" in item) newItem["foundation"] = item["foundation"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
        if ("foundation2" in item) newItem["foundation2"] = item["foundation2"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
        if ("completion" in item) newItem["completion"] = item["completion"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];

        // Extract more data for subject of the narrative
        if (qid == narra.subjectID) { 
            if ("marriageDate" in item) newItem["marriageDate"] = item["marriageDate"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];

            if ("father" in item) {
                newItem["father"] = item["father"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["father"]);
            }
            if ("mother" in item) {
                newItem["mother"] = item["mother"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["mother"]);
            }
            if ("brother" in item) {
                newItem["brother"] = item["brother"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["brother"]);
            }
            if ("sister" in item) {
                newItem["sister"] = item["sister"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["sister"]);
            }
            if ("spouse" in item) {
                newItem["spouse"] = item["spouse"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["spouse"]);
            }
            if ("birthPlace" in item) {
                newItem["birthPlace"] = item["birthPlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["birthPlace"]);
            }
            if ("deathPlace" in item) {
                newItem["deathPlace"] = item["deathPlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["deathPlace"]);
            }
            if ("marriagePlace" in item) {
                newItem["marriagePlace"] = item["marriagePlace"]["value"].split("entity/")[1];
                newItemsToLoad.push(newItem["marriagePlace"]);
            }
        }

		var newRole;

        // Extract roles of the entity
        if ("occupation" in item) {
            newRole = item["occupation"]["value"].split("entity/")[1];
            if (newItem["role"].indexOf(newRole) < 0) {
                newItem["role"].push(addRole(newRole));
            }
        } 
        if ("position" in item) {
            newRole = item["position"]["value"].split("entity/")[1];
            if (newItem["role"].indexOf(newRole) < 0) {
                newItem["role"].push(addRole(newRole));
            }
        }

        // Extract type of the entity
        if ("type" in item) {
			newItem["type"].push(item["type"]["value"].split("entity/")[1]);
    	} else if (force) {
            newItem["type"].push("other");
        }

        narra.items[qid] = newItem;
    } else {
        try {
            // Extract additional types and roles
            if ("type" in item && "type" in narra.items[qid]) narra.items[qid].type.push(item["type"]["value"].split("entity/")[1]);
            if ("occupation" in item && "role" in narra.items[qid]) narra.items[qid].role.push(addRole(item["occupation"]["value"].split("entity/")[1]));
            if ("position" in item && "role" in narra.items[qid]) narra.items[qid].role.push(addRole(item["position"]["value"].split("entity/")[1]));
        } catch(e) {
            console.log(currentTime() + "Error in sparqlToItem: " + narra.items[qid]);
        }
    }
    return newItemsToLoad;
}

// Make query for entity
function makeQuery(qids, isSubject, force) {
    var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
    "wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 wd:Q35120 " +
    "wd:Q15474042 wd:Q4167836 wd:Q41176 wd:Q8205328 wd:Q5127848 wd:Q27096213\n}";

	return "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
		"SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc ?image " +
		"?birth ?death ?foundation ?foundation2 ?completion ?occupation ?position ?coordinatesPoint" +
		(isSubject ? subjectExtract : "") +
		"\nWHERE {\n" +
		"VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
		(force ? "" : types) +
		(force ? "OPTIONAL {?uri wdt:P31 ?class.\n}" : "?uri wdt:P31 ?class.\n") +
		(force ? "OPTIONAL {?class wdt:P279* ?type.\n " + types + "}" : "?class wdt:P279* ?type.\n") +
		"OPTIONAL { ?uri wdt:P18 ?image. }\n" +
		"OPTIONAL { ?uri wdt:P569 ?birth. }\n" +
		"OPTIONAL { ?uri wdt:P570 ?death. }\n" +
		"OPTIONAL { ?uri wdt:P571 ?foundation. }\n" +
		"OPTIONAL { ?uri wdt:P580 ?foundation2. }\n" +
		"OPTIONAL { ?uri wdt:P1619 ?completion. }\n" +
		"OPTIONAL { ?uri wdt:P106 ?occupation. }\n" +
		"OPTIONAL { ?uri wdt:P39 ?position. }\n" +
		"OPTIONAL { ?uri wdt:P625 ?coordinatesPoint. }\n" +
		(isSubject ? subjectQuery : "") +
		"OPTIONAL { ?uri rdfs:label ?itName filter (lang(?itName) = 'it'). }\n" +
		"OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
		"OPTIONAL { ?uri schema:description ?itDesc filter (lang(?itDesc) = 'it'). }\n" +
		"OPTIONAL { ?uri schema:description ?enDesc filter (lang(?enDesc) = 'en'). }\n" + "\n\} limit 50000";
}

// Perform SPARQL request for each entity
function sparqlRequest(qids, lastRun, callback, force, withoutArrow=false) {
    console.log(currentTime() + "Wikidata request");

    // If requesting main subject entity, make special query
    var query = makeQuery(qids, qids[0] == narra.subjectID, force);
	
	// print query in the console (only if narrative doesn't exist yet)
	console.log("Query:       " + query);

    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

	// print query result in the console (only if narrative doesn't exist yet)      
    console.log("URLL for query result:       " + sparqlURL);

    $.getJSON(sparqlURL)
		.done(function (data) {
			
			// if sparql query does a result...
			if(data["results"]["bindings"] != ""){
					
				narra.counter += 1;

				data = data["results"]["bindings"];

				var i;
				
				for (i=0; i < data.length; i++) {
					var newItemsToLoad = sparqlToItem(data[i], force);
					if (newItemsToLoad.length > 0) sparqlRequest(newItemsToLoad, narra.counter + 1, function(){}, undefined, true);
				}

				for (i=0; i < qids.length; i++) {
					var qid = qids[i];
					
					if (qid in narra.items) {
						forceSaveObjectToDB(narra.items, qid);
					}

					// If this is the last run...
					if (i == qids.length - 1 && narra.counter == lastRun) {
						
						console.log("Last run of sparql request");
						console.log(qids);
						updateTitle();
						
						if (callback !== undefined) {
							callback(narra.items[qid]);
						} else {
							console.log("questo è il qids del lastrun: " );
							console.log(qids);
							console.log("qids.length è > 0 ?: " + qids.length);
							if (qids.length > 1) {
								$(".spinner-loader").remove();
								$("#controls .data").remove();
								makeEntities(narra.items, withoutArrow);
								finalLoad();
							}
						}
					}
				}

				// If entity is subject of narrative, perform Wikipedia request
				if (qids[0] == narra.subjectID) {
					var subjectName = narra.items[narra.subjectID][narra.currentLang + "Name"];
					wikipediaRequest("", narra.currentLang, [], subjectName);
				}
			 
			// else if sparql query is empty...
			} else {
				
				//change url in browser
				window.history.pushState('index', '', '/index.html');
				
				// delete narration previously inserted in db and shows error
				$.ajax({
					type: "POST",
					url: "PHP//deleteNarration.php", 
					dataType: "JSON",					
					data: {user : narra.user, id : narra.id_n, subject : narra.subjectID.toLowerCase()},
					success: function(resp) {

					},
					error: function(response){
						var a= JSON.stringify(response);
						console.log(a);

					}
								
				});
				
				// show error for this entity
				showModal(
					"Entity not found",
					'this entity has no class in wikidata. Please insert property "instance of" in the <a target="_blank" href="https://www.wikidata.org/wiki/'+narra.subjectID+'">wikidata page</a> or report this error to <a href="mailto:emanuele.lenzi@isti.cnr.it?subject=NBVT%20Entity_Error_'+narra.subjectID+'">emanuele.lenzi@isti.cnr.it</a>',
					"Back",
					"Confirm",
					function() {
						window.location.href = "index.html";
					},
					function() {
						window.location.href = "index.html";

					}
				)

			}
		
		}).fail(function(){
		
			showModal(
				"Entity not found",
				"there is an error with this wikidata entity. Please search another entity and report this error to <a href='mailto:emanuele.lenzi@isti.cnr.it?subject=NBVT%20Entity_Error_"+narra.subjectID+"'>emanuele.lenzi@isti.cnr.it</a>",
				"Back",
				"Confirm",
				function() {
				},
				function() {
				}
			)
		
		});
}

// Request for new entities added by the user
function newEntityRequest(title, lang) {
    var url = "https://wikidata.org/w/api.php?action=wbgetentities&props=labels|claims|sitelinks|descriptions&callback=?&titles=" +
        title + "&sites=" + lang + "wiki&languages=it|en&format=json";            
        console.log(currentTime() + url);
    $.getJSON(url, function (data) {
        console.log(currentTime() + "Loading new entity");
        data = data["entities"];
        for (var key in data) {
            data[key]["_id"] = key;
            data[key]["id"] = key;
            sparqlRequest([key], narra.counter + 1, undefined, true, true);
        }
    });
}

// Sort entities by label
function sortByLabel(keys) {
    keys.sort(function (a, b) {
        var nameA = capitalize(getLabel(a));
        var nameB = capitalize(getLabel(b));
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return keys;
}

// Make a div for each entity
function makeEntities(items, withoutArrow=false) {
    console.log(currentTime() + "Making entities");

	var container = $("#container");

    var showContainer;
    if (container.css("display") == "flex") {
        showContainer = true;
    } else {
        container.css("visibility", "hidden");
        container.css("display", "flex");
        showContainer = false;
    }

    var keys = sortByLabel(Object.keys(items));
           
    keys.splice(keys.indexOf(narra.subjectID), 1);
    keys.unshift(narra.subjectID);
    
    var $container = $("<div id='data-container' />");
    
    for (var i = 0; i < keys.length; i++) {
        try {
            $container.append(makeStaticDraggable($(makeDataDiv(keys[i], withoutArrow))));
        }
        catch (TypeError) {
            console.log(currentTime() + "TypeError: " + keys[i]);
        }
    }
    $('#controls').append($container);
    console.log(currentTime() + "Made entities");

    if (!showContainer) {
        container.css("display", "none");
        container.css("visibility", "visible");
    }
}

// Save relations between events
function saveRelations() {
    narra.rels = {};
    $(".relContainer").each(function (k, v) {
        v = $(v);
        if (v.find(".timelineEvent").length > 0) {
            var evid = v.attr("data-for");
            var causedBy = [];
            var partOf = [];
            v.find(".causedBy").children(".timelineEvent").each(function (j, x) {
                causedBy.push($(x).attr("data-id"));
            });
            v.find(".partOf").children(".timelineEvent").each(function (j, x) {
               partOf.push($(x).attr("data-id"));
            });
            narra.rels[evid] = {"causedBy": causedBy, "partOf": partOf, "id": evid};
            
            saveRelationsToDB();
        }
    });
}

// Save relations to database
function saveRelationsToDB() {
    var relsDoc = {"_id": "D1", "rels": narra.rels}
    var relsList = {"D1": relsDoc};
	console.log(relsList)
    saveObjectToDB(relsList, "D1");
}

// Load relations between events
function loadRelations() {
    for (var key in narra.rels) {
        var event = narra.rels[key];
		
		console.log("ora");
		console.log(key);
        
        if (event !== undefined && 'causedBy' in event) {
            event.causedBy.forEach(function (item) {
                if (item !== undefined)
                    dropOnRelation($(".relContainer[data-for=" + key + "]").find(".causedBy"),
                    $("#bottomTimeline").find(".timelineEvent[data-id=" + item + "]"));
            });
        }

        if (event !== undefined && 'partOf' in event) {
            event.partOf.forEach(function (item) {
                if (item !== undefined)
                    dropOnRelation($(".relContainer[data-for=" + key + "]").find(".partOf"),
                    $("#bottomTimeline").find(".timelineEvent[data-id=" + item + "]"));
            });
        }
    }
}

function dropOnRelation(rel, drag, save) {
    $(rel).css("vertical-align", "top");
            if ($(rel).find(".timelineEvent#" + $(drag).attr("id")).length === 0) {
                var thisID = $(rel).parent().attr("data-for");
                
                var $drag = drag.clone();
                $drag.find(".deleteButton").click(function () {
                    if ($(rel).hasClass("causedBy")) {
                        narra.rels[thisID]["causedBy"].splice(drag.attr("data-id"), 1);
                    }
                    else if ($(rel).hasClass("partOf")) {
                        narra.rels[thisID]["partOf"].splice(drag.attr("data-id"), 1);
                    }
                    $(this).parent().remove();
                    saveRelationsToDB();
                });
                $drag.mouseenter(function () { $(this).find(".deleteButton").fadeToggle("fast") });
                $drag.mouseleave(function () { $(this).find(".deleteButton").fadeToggle("fast") });
                $(rel).append($drag);
    }
    if (save) {
        saveRelations();
        saveRelationsToDB();
    }
}

function notAllowed(title, reason) {
    if (!workspaceIsEmpty()) {
        showModal(
            title,
            "Please add at least one event before " + reason,
            "OK",
            "Cancel",
            function() {
            },
            function() {
            }
        );
    }
}

// Open relations view
function openRelations() {
    if (Object.keys(narra.events).length < 1) {
        notAllowed("Load Relations", " loading the relations view.");
        return false;
    }

	var timeline = $("#timeline");
	var overlay = $("#overlay");
	var bottomTimeline = $("#bottomTimeline");

    $("#home").text("BACK");
    $("#backButton").fadeToggle("slow");
    $("#container").slideToggle("slow");
    $("#bigName").text("Causal and Mereological Relations");
    timeline.addClass("withArrows").css("height", "70%");
    overlay.empty();
    bottomTimeline.empty();
    $("#timeline .timelineEvent").each(function (k, v) {
        var oldID = $(this).attr('id');
         bottomTimeline.append(makeStaticDraggable($(this).clone().attr("data-id", oldID).addClass("draggableEvent").removeAttr("id").show()));
         $(this).css("height", "40%");
        overlay.append("<div class='relContainer' data-for='" + $(v).attr('id') + "'><div class='relation causedBy'><h3>Caused by</h3></div><div class='relation partOf'><h3>Part of</h3></div></div>");
    });
    timeline.append(overlay);
    overlay.fadeToggle("slow");
    $("#bottomTimeline .timelineEvent .eventBottom .data").remove();
    bottomTimeline.fadeToggle("slow");
    $("#relHelpContainer").fadeToggle("slow");
    $(".relation")
    .droppable({
        drop: function (event, ui) {
			dropOnRelation(this, ui.draggable, true);
		}
    });
    loadRelations();
}

// Restore initial view
function restoreInitialView() {
    saveRelations();
    updateTitle();

	var topTitle = $('#topTitle');
	var timeline = $("#timeline");

    $("#home").text("HOME");
    $('#mainSource').remove();
    $("#container").slideToggle();
    $("#backButton").fadeToggle("slow");
    topTitle.css('height', '6%');
    timeline.removeClass("withArrows").css("height", "32%");
    timeline.children(".timelineEvent").css("height", "");
    $("#overlay, #bottomTimeline, #relHelpContainer").hide("slow");
    $("body").append($("#overlay"));
    timeline.show();
    $('#footer').hide();
    $("#timeline-embed").hide();
	$("#mapdiv").hide();	
    topTitle.css("margin-bottom", "0");
	$('.dropdown').css( 'top', '-5%');
    window.timeline = undefined;
	$("#eventSearchDiv").show();

	// for map slide bug visualization
	currentSlide=0;
	arraySlide=[];
	$(document).off( "click", ".vco-slidenav-next");
	$(document).off( "click", ".vco-slidenav-previous");
	
	$('#mapdiv').empty();
	window.storymap = undefined;

	//change size of title
	$('.subjectName').css('font-size', '2.0em');
}

// Create modal dialogs
function showModal(title, text, btnCancel, btnOK, callbackCancel, callbackOK) {
    var $modal = $("<div class='modal fade'>" +
		"<div class='modal-content'>" +
		"<div class='modal-header'>" +
		"<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
		"<h5 class='modal-title'>" + title +"</h5>" +
		"</div>" +
		"<div class='modal-body'>" +
		"<p class='modal-text'>" + text + "</p>" +
		"</div>" +
		"<div class='modal-footer'>" +
		"<button type='button' class='btn btn-secondary' data-dismiss='modal'>" + btnCancel + "</button>" +
		"<button type='button' class='btn btn-primary' data-dismiss='modal'>" + btnOK + "</button>" +
		"</div></div></div></div>");
    $modal.find(".btn-secondary").click(callbackCancel);
    $modal.find(".btn-primary").click(callbackOK);
    $modal.modal("show");
}

function b64toBlob(b64, qid, onsuccess, onerror) {
    var img = new Image();
    img.src = b64;

    img.onerror = onerror;

    img.onload = function onload() {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function(blob) {
            narra.usedImages[qid] = true;
            uploadcare.fileFrom('object', blob)
            .done(function(fileInfo) {
                narra.items[qid].image = fileInfo.cdnUrl + "image.jpg";
                saveObjectToDB(narra.items, qid);
            }).fail(function(error) {
                  console.log(error);
            });
        }, function(error) {
            console.log(error);
        });
    }
}

// control if there are dates on events
function controlDateOnEvents() {
	
	var dateOk= true;
	var eventsNotDates="";
	var eventsWithDates= {};
	var numberOfEventsNotDates= 0;
	
	// control if there are events with no coordinates and save events with coordinate in an object
	for (var i in narra.events) {
			if (narra.events[i].hasOwnProperty('start') &&  narra.events[i].start != "" ) {
				eventsWithDates[i]=narra.events[i];
				numberOfEventsNotDates++;
				
			} else {
				dateOk = false;
				eventsNotDates += narra.events[i].title + '</br>';
			}
	}
	
	if (numberOfEventsNotDates > 0) {
		
		// Not all events have coordinates. Visualize only events with coordinates if press continue
		if(!dateOk){
				
			showModal(
				"Visualize Timeline",
				"These events have no date: </br></br>" + eventsNotDates + "</br>Do you want to continue excluding them?",
				"Back",
				"Continue",
				function() {
				},
				function() {
					visualizeTimeline(eventsWithDates);
				}
			);
		
		// All events have coordinates
		} else {
			visualizeTimeline(narra.events);
		}
	
	} else {
		
		// All events haven't coordinates
		showModal(
			"Visualize Timeline",
			"There are no events with date",
			"Back",
			"Continue",
			function() {
			},
			function() {
			}
		);
	
	}

}

// Ask user to save before visualizing
function confirmVisualizeTimeline() {
    if (!workspaceIsEmpty()) {
        showModal(
            "Visualize Timeline",
            "Do you want to save the current event before visualizing?",
            "Don't Save",
            "Save",
            function() {
            },
            function() {
                if (saveEvent() !== undefined) {
                    resetWorkspace();
                    controlDateOnEvents();
                }
                else {
                    // TODO INSERT VALIDATION
                }
            }
        );
    }
    else {
        controlDateOnEvents();
    }
}

// Visualize on a timeline
function visualizeTimeline(eventsOfNarration) {

	var mainSource = $('meta[name=mainSource]');
	var topTitle = $('#topTitle');

    if (mainSource.attr("content") !== undefined) {
        topTitle.append('<div id="mainSource"><i>' + mainSource.attr("content") + '</i></div>');
        topTitle.css('height', '7%');
    }
    
    if (Object.keys(narra.events).length < 1) {
        notAllowed("Visualize Timeline", " visualizing the timeline.");
        return false;
    }

    $("#home").text("BACK");
    $("#backButton").fadeToggle("slow");
    $("#container").hide();
	$("#eventSearchDiv").hide();
    $("#timeline").hide();
    $('#timeline-embed').show();
    $('#footer').show();
    topTitle.css("margin-bottom", "2%");
	$('.dropdown').css( 'top', '-8%');
	
    narra.usedImages = {};
	
	// Function to sort events by position first of time
	var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
	}

    // Sort events by time
    var events = Object.keys(eventsOfNarration).sort(sort_by_position);

    // Define the slides of the timeline
    narra.slides = events.map(
        function (key) {
            var event = narra.events[key];            
            
            // Set ID of timeline slide
            event.unique_id = "slide-" + event._id;
            
            // Parse dates from arrays
            var sDate = parseDate(event.start);
            var eDate = parseDate(event.end);
                                                
            // Set start date of timeline slide
            event.start_date = {
                'year': sDate.getFullYear(),
                'month': event.start.length > 5 ? sDate.getMonth() + 1 : "",
                'day': event.start.length > 8 ? sDate.getDate() : "",
            };
            
            // Set end date of timeline slide
            event.end_date = {
                'year': eDate.getFullYear(),
                'month': event.end.length > 5 ? eDate.getMonth() + 1 : "",
                'day': event.end.length > 8 ? eDate.getDate() : "",
            };
            
            var fragment = "";
            var source;
            var secondaryAppend = "";
            var primaryAppend = "";
            var entitiesList = [];
                        
            event.text = {
                'headline': event.title,
                'text': event.description ? event.description : ""
            };

            // Function to link to English or Italian Wikipedia
			function createLinkWithTooltip(qid, lang) {

				var linkIri;
					
					if(qid.startsWith("Q")){
						linkIri = "https://www.wikidata.org/wiki/" + narra.items[qid]['_id'];
					} else {
						linkIri = "https://tool.dlnarratives.eu/CustomEntity/?idU="+qid+"&user="+narra.user+"&idN="+narra.id_n+"&subject="+narra.subjectID;
					}
					
					return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' target='_blank' href='"+linkIri+"'>" + narra.items[qid][lang + 'Name'] + "</a>";
			}

            // Get list of entities and link to Wikipedia
            for (var qid in event.props) {
                var prop = event.props[qid];
                if (qid !== undefined && qid in narra.items) {
						//en entities
						if (narra.currentLang == "en") {
							if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							} else if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							}
						// it entities
						} else {
							if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							} else if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							}
						}
                }

                // Handle event images (or other media)
                if (prop !== undefined) {
					
					// load media of event if any
					if(event.eventMedia != ""){
							
						event.media = {'url' : event.eventMedia, 'caption' : event.eventMediaCaption};
						  
					// else load entities images
					} else {
                    
						if (event.media && event.media.url && event.media.url.startsWith('data')) {
							event.media = undefined;
						}
						
						if (event.media === undefined) {
							
							if (narra.items[qid] !== undefined && 'image' in narra.items[qid] && ! (qid in narra.usedImages)) {
								
								var image = narra.items[qid].image;
								
								if (image.startsWith("http")) {
									event.media = {'url': narra.items[qid].image
										.replace('http:', 'https:')
										.replace('Special:FilePath', 'Special:Redirect/file')
										.replace('/wiki/', '/w/index.php?title=')};
									narra.usedImages[qid] = true;
								
									if (event.media && "url" in event.media && event.media.url.indexOf('/w/index.php?title=') > -1) {
										event.media.url = event.media.url + '&width=700&type=.jpg';
									}
								}
							}
						}
					
					}

					var j;

                    // Handle secondary sources of events
                    if ('secondary' in prop && prop.secondary.length > 0) {
                        for (j = 0; j < prop.secondary.length; j++) {
                            if (!event.text.text && prop.secondary[j].text) {
                                event.text.text = prop.secondary[j].text;
                            }
                            if (prop.secondary[j].title) {
                                source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
                                if (prop.secondary[j].reference != "") {
                                    source += ", " + prop.secondary[j].reference;
                                }
                                source += '\</li>';
                                if (secondaryAppend.indexOf(source) < 0) {
                                    secondaryAppend += source;
                                }
                            }
                        }
                    }

                    // Handle primary sources of events
                    if ('primary' in prop && prop.primary.length > 0) {
                        for (j = 0; j < prop.primary.length; j++) {
                            if (prop.primary[j].title) {
                                source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
                                if (prop.primary[j].reference != "") {
                                    source += ", " + prop.primary[j].reference;
                                }
                                source += '\</li>';
                                if (primaryAppend.indexOf(source) < 0) {
                                    primaryAppend += source;
                                }
                            }
                        }
                    }
                }
                if (fragment.length > 0) break;
            }

            // Set event text
            event.text.text += fragment;
            var textToAppend = "";

            // Function to make a list of digital objects
            function makeDigObjList(urls) {
                var results = [];
				var l;
				var a;
				
				//if digital objets is array of objects (url + title))
				if (urls && $.type(urls) === "array" && $.type(urls[0]) === "object") {

					for(l = 0; l < urls.length; l++){
						a = document.createElement("a");
						a.setAttribute("href", urls[l].url);
						a.setAttribute("target", "_blank");
						a.text = urls[l].title;
						results.push(a.outerHTML);	
					}
				//if digital objets are old djobj (only array of urls)
				} else if (urls && $.type(urls) === "array") {
                    for (l = 0; l < urls.length; l++) {
                        a = document.createElement("a");
                        a.setAttribute("href", urls[l]);
                        a.setAttribute("target", "_blank");
                        a.text = l + 1;
                        a.setAttribute("onclick", "showDigObjImage(this)");
                        results.push(a.outerHTML);
                    }
                } else if (urls && $.type(urls) === "string") {
                    a = document.createElement("a");
                    a.setAttribute("href", urls);
                    a.setAttribute("target", "_blank");
                    a.text = "1";
                    a.setAttribute("onclick", "showDigObjImage(this)");
                    results.push(a.outerHTML);
                }
                return results.join(" • ");
            }

            // Display digital object list
            var digObjList = makeDigObjList(event.objurl);

            // Append secondary sources to HTML
            if (secondaryAppend)
                textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

            // Append primary sources to HTML
            if (primaryAppend) {
				textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';
			}

            // Append list of entities to HTML
            if (entitiesList) {
                textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
            }

            // Append list of digital objects to HTML
            if (digObjList) {
                textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
                    + digObjList + '</span>';
            }

            // Set final event text
            if (textToAppend) {
                event.text.text += textToAppend;
            }
            
			console.log(event);
            return event;
        }
    );

    // Reload image selection list in case of changes
    var observer = new MutationObserver(function (m) {
		console.log(observer);
        if (m[0].addedNodes[0].nodeName === "#text" || m[0].addedNodes[0].nodeName == "IMG") {
			makeImageSelect(window.timeline.getSlide(0).data.unique_id);
            this.disconnect();
		}
    });

    // Observe timeline for changes
    observer.observe(document.getElementById('timeline-embed'), { childList:true, subtree:true});

    // Create timeline object
    window.timeline = new TL.Timeline('timeline-embed', {'events': narra.slides},
        {
            scale_factor: 1,
            height: 700,
            timenav_height_percentage: 42,
            start_at_slide: 0
        }
    )
    .on("change", function(data) {
        makeImageSelect(data.unique_id);
    });    
}

// Confirm removal of entity from event
function confirmVisualizeMap() {
	
	var coordinateOk= true;
	var eventsNotCoordinates="";
	var eventsWithCoordinates= {};
	var numberOfEventsNotCoordinates= 0;
	
	// control if there are events with no coordinates and save events with coordinate in an object
	for (var i in narra.events) {
			if (narra.events[i].hasOwnProperty('latitud') &&  narra.events[i].hasOwnProperty('longitud')  &&  narra.events[i].latitud != "" && narra.events[i].longitud != "") {
				eventsWithCoordinates[i]=narra.events[i];
				numberOfEventsNotCoordinates++;
				
			} else {
				coordinateOk = false;
				eventsNotCoordinates += narra.events[i].title + '</br>';
			}
	}
	
	if (numberOfEventsNotCoordinates > 0) {
		
		// Not all events have coordinates. Visualize only events with coordinates if 'continue' is pressed
		if (!coordinateOk) {
				
			showModal(
				"Visualize Map",
				"These events have no coordinates: </br></br>" + eventsNotCoordinates + "</br>Do you want to continue excluding them?",
				"Back",
				"Continue",
				function() {
				},
				function() {
	
					if(narra.info.hasOwnProperty("CSVnumber")){
						window.open("PHP//previewStorymapPolygons.php?preview=" + narra.id_n + narra.user +'-'+narra.dbName +"&user="+ narra.user);
					} else {
						window.open("PHP//previewStorymapPolygons.php?preview=" + narra.id_n + narra.user +'-'+narra.dbName +"&user="+ narra.user);
					}

				}
			);
		
		// All events have coordinates
		} else{
			
			if (narra.info.hasOwnProperty("CSVnumber")) {
					window.open("PHP//previewStorymapPolygons.php?preview=" + narra.id_n + narra.user +'-'+narra.dbName +"&user="+ narra.user);
			} else {
					window.open("PHP//previewStorymapPolygons.php?preview=" + narra.id_n + narra.user +'-'+narra.dbName +"&user="+ narra.user);
			}

		}
	
	} else {
		
		// All events haven't coordinates
		fadeout('failed-map', 1500);
	
	}

}

//visualize map
 // array of slides (for bug visualization)
var arraySlide= [];
// index for current slide (for bug visualization)
var currentSlide= 0;

function visualizeMap(eventsOfNarration) {
	
		//change size of title
		$('.subjectName').css('font-size', '2.5em');

		var mainSource = $('meta[name=mainSource]');
		var topTitle = $('#topTitle');
	
		if (mainSource.attr("content") !== undefined) {
			topTitle.append('<div id="mainSource"><i>' + mainSource.attr("content") + '</i></div>');
			topTitle.css('height', '7%');
		}
		
		if (Object.keys(narra.events).length < 1) {
			notAllowed("Visualize Timeline", " visualizing the timeline.");
			return false;
		}
		
		$("#home").text("BACK");
		$("#backButton").fadeToggle("slow");
		$("#container").hide();
		$("#eventSearchDiv").hide();
		$("#timeline").hide();
		$('#timeline-embed').hide();
		$('#mapdiv').show();
		$('#footer').show();

		// display button publishMap in table, and position near "username" button
		
		topTitle.css("margin-bottom", "2%");
		
		$('.dropdown').css( 'top', '-8%');

		narra.usedImages = {};
		
		var sort_by_position = function( a , b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
		}

		// Sort events by position
		var events = Object.keys(eventsOfNarration).sort(sort_by_position);

		// Define the slides of the map
		narra.slides = events.map(
			function (key) {
				var event = narra.events[key];            
				
				// Set ID of timeline slide
				event.unique_id = "slide-" + event._id;
				
				// Parse dates from arrays
				var sDate = parseDate(event.start);
				var eDate = parseDate(event.end);
							
				
				// Set start date of timeline slide
				event.start_date = {
					'year': sDate.getFullYear(),
					'month': event.start.length > 5 ? sDate.getMonth() + 1 : "",
					'day': event.start.length > 8 ? sDate.getDate() : "",
				};
				
				// Set end date of timeline slide
				event.end_date = {
					'year': eDate.getFullYear(),
					'month': event.end.length > 5 ? eDate.getMonth() + 1 : "",
					'day': event.end.length > 8 ? eDate.getDate() : "",
				};
				
				
				event.date= sDate.getFullYear() + "-" + eDate.getFullYear();
				
				var fragment = "";
				var source;
				var secondaryAppend = "";
				var primaryAppend = "";
				var entitiesList = [];
							
				event.text = {
					'headline': event.title,
					'text': event.description ? event.description : ""
				};

				event.location = {
					
					"name": "Kent County, Maryland",
					"lat": parseFloat(event.latitud),
					"lon": parseFloat(event.longitud),
					"zoom": 10,
					"line": true

				};

				// Function to link to English or Italian Wikipedia
				function createLinkWithTooltip(qid, lang) {

					var linkIri;

					if(qid.startsWith("Q")){
						linkIri = "https://www.wikidata.org/wiki/" + narra.items[qid]['_id'];
					} else {
						linkIri = "https://tool.dlnarratives.eu/CustomEntity/?idU="+qid+"&user="+narra.user+"&idN="+narra.id_n+"&subject="+narra.subjectID;
					}
					
					return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' target='_blank' href='"+linkIri+"'>" + narra.items[qid][lang + 'Name'] + "</a>";
				}

				// Get list of entities and link to Wikipedia
				for (var qid in event.props) {

					var prop = event.props[qid];

					if (qid !== undefined && qid in narra.items) {
						//en entities
						if (narra.currentLang == "en") {
							if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							} else if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							}
						// it entities
						} else {
							if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							} else if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							}
						}
						
					}

					// Handle event images (or other media)
					if (prop !== undefined) {
						
						// load media of event if any
						if (event.eventMedia != "") {
							
							event.media = {'url' : event.eventMedia, 'caption' : event.eventMediaCaption};
						  
						// else load entities images
						} else {
						
							if (event.media && event.media.url && event.media.url.startsWith('data')) {
								event.media = undefined;
							}
							
							if (event.media === undefined) {
								
								if (narra.items[qid] !== undefined && 'image' in narra.items[qid] && ! (qid in narra.usedImages)) {
									
									var image = narra.items[qid].image;
									
									if (image.startsWith("http")) {
										event.media = {'url': narra.items[qid].image
											.replace('http:', 'https:')
											.replace('Special:FilePath', 'Special:Redirect/file')
											.replace('/wiki/', '/w/index.php?title=')};
										narra.usedImages[qid] = true;
									
										if (event.media && "url" in event.media && event.media.url.indexOf('/w/index.php?title=') > -1) {
											event.media.url = event.media.url + '&width=700&type=.jpg';
										}
									}
								}
							}
							
						}

						var j;

						// Handle secondary sources of events
						if ('secondary' in prop && prop.secondary.length > 0) {
							for (j = 0; j < prop.secondary.length; j++) {
								if (!event.text.text && prop.secondary[j].text) {
									event.text.text = prop.secondary[j].text;
								}
								if (prop.secondary[j].title) {
									source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
									if (prop.secondary[j].reference != "") {
										source += ", " + prop.secondary[j].reference;
									}
									source += '\</li>';
									if (secondaryAppend.indexOf(source) < 0) {
										secondaryAppend += source;
									}
								}
							}
						}

						// Handle primary sources of events
						if ('primary' in prop && prop.primary.length > 0) {
							for (j = 0; j < prop.primary.length; j++) {
								if (prop.primary[j].title) {
									source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
									if (prop.primary[j].reference != "") {
										source += ", " + prop.primary[j].reference;
									}
									source += '\</li>';
									if (primaryAppend.indexOf(source) < 0) {
										primaryAppend += source;
									}
								}
							}
						}
					}
					if (fragment.length > 0) break;
				}

				// Set event text
				event.text.text += fragment;
				var textToAppend = "";

				// Function to make a list of digital objects
				function makeDigObjList(urls) {
					var results = [];
					var l;
					var a;
					
					//if digital objets is array of objects (url + title))
					if (urls && $.type(urls) === "array" && $.type(urls[0]) === "object") {
						
						for(l = 0; l < urls.length; l++){
							a = document.createElement("a");
							a.setAttribute("href", urls[l].url);
							a.setAttribute("target", "_blank");
							a.text = urls[l].title;
							results.push(a.outerHTML);	
						}
					//if digital objets are old (only array of URLs)
					} else if (urls && $.type(urls) === "array") {
						for (l = 0; l < urls.length; l++) {
							a = document.createElement("a");
							a.setAttribute("href", urls[l]);
							a.setAttribute("target", "_blank");
							a.text = l + 1;
							results.push(a.outerHTML);
						}
					}
					else if (urls && $.type(urls) === "string") {
						a = document.createElement("a");
						a.setAttribute("href", urls);
						a.setAttribute("target", "_blank");
						a.text = "1";
						results.push(a.outerHTML);
					}
					return results.join(" • ");
				}

				// Display digital object list
				var digObjList = makeDigObjList(event.objurl);

				// Append secondary sources to HTML
				if (secondaryAppend)
					textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

				// Append primary sources to HTML
				if (primaryAppend) {
					textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';
				}

				// Append list of entities to HTML
				if (entitiesList) {
					textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
				}

				// Append list of digital objects to HTML
				if (digObjList) {
					textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
						+ digObjList + '</span>';
				}

				// Set final event text
				if (textToAppend) {
					event.text.text += textToAppend;
				}
										
				return event;
			}
		);

		var slides = {"slides": narra.slides};
		
		var storymap_options = { 

			"map_type" : "osm:standard",
			"calculate_zoom" : true
		
		};
 
	//////////////////////
	//Color marker switch//
	//////////////////////

	var leafletMarkerIcon = $( ".leaflet-marker-icon:eq("+currentSlide+")" );

 	// Button NEXT. show next slide. Hide slide +1 and -1
	$(document).on('click','.vco-slidenav-next',function(){

		// remove class active for this old marker
		leafletMarkerIcon.removeClass('activeMarker');
		
		currentSlide++;
		
		// add class active for actual new marker
		leafletMarkerIcon.addClass('activeMarker');

	});
	
	// Button PREVIUS: show previous slide. Hide slide +1 and -1
	$(document).on('click','.vco-slidenav-previous',function(){
		
		// remove class active for this old marker
		leafletMarkerIcon.removeClass('activeMarker');
		
		currentSlide--;
		
		// add class active for actual new marker
		leafletMarkerIcon.addClass('activeMarker');

	});
	
	// Button Beginning: show first slide. hide the previous
	$(document).on('click','.vco-menubar-button:eq(1)',function(){
		
		// remove class active for this old marker
		leafletMarkerIcon.removeClass('activeMarker');

		// add class active for first new marker
		$( ".leaflet-marker-icon:eq(0)" ).addClass('activeMarker');
		
		currentSlide=0;

	});

	// when map is loaded, create array of slides, and put click on the markers
	var checkExist = setInterval(function() {
		if ($('.leaflet-marker-icon').length) {
			console.log("map loaded");

			//append div legend on map
			$('.vco-map-display').append('<div class="slideLegend" > <div class="legendRow"> <div class="ContainerLegenttext"><p><span style="color:#c34528">&#9632;</span> Current event</p></div>     <div class="ContainerLegenttext"><p><span style="color:#e6e600">&#9632;</span> Historical event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#2eb82e">&#9632;</span> Natural event</p></div>   <div class="ContainerLegenttext"><p><span style="color:#ff9900">&#9632;</span> Valorisation event</p></div> <div class="ContainerLegenttext"><p><span style="color:#0000CD">&#9632;</span> Descriptive event</p></div> </div></div>');

			// create array of slides
			$('.vco-slider-item-container .vco-slide').each(function(index) {
				arraySlide[index]= $(this);
			});

			// first marker active
			$( ".leaflet-marker-icon:eq(0)" ).addClass('activeMarker');

			// put click on all markers (show slide of clicked marker and make it clickable; hide the previous)
			$('.leaflet-marker-pane .leaflet-marker-icon').each(function(index) {

				var leafletMarkerIconEq = $('.leaflet-marker-icon:eq(' +index+ ')');

				//append click on marker
				leafletMarkerIconEq.on('click', function(){

					leafletMarkerIcon.removeClass('activeMarker');

					$( ".leaflet-marker-icon:eq("+index+")" ).addClass('activeMarker');

					currentSlide = index;
				});

				// color markers
				if (storymap.data.slides[index].hasOwnProperty('mapMarkerColor')) {
					leafletMarkerIconEq.css("color", storymap.data.slides[index].mapMarkerColor);
				}

			});

		  clearInterval(checkExist);
	   }
	}, 100);

	// Create timeline object
	window.storymap = new KLStoryMap.StoryMap('mapdiv', {'storymap': slides}, storymap_options);

	window.onresize = function() {
		storymap.updateDisplay(); // this isn't automatic
	}

	// Leaflet Zoom control
	const zoomControl = L.control.zoom({ position: "topleft" });

	// grouping of controls
	const leafletControlsToAdd = [zoomControl];

	// event for when the Story Map is loaded
	storymap.on("loaded", function() {
	  // leaflet.js web map object
	  const leafletMap = storymap.map;

	  // add controls to Leaflet web map
	  leafletControlsToAdd.forEach(element => leafletMap.addControl(element));
	});
	
}

function publishNarration(preview=0){

		performance.now();

		var title = $('#bigName').text();
		narra.usedImages = {};

		var sort_by_position = function(a, b){
			a = narra.events[a].position;
			b = narra.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
		}

		// Sort events by position
		var events = Object.keys(narra.events).sort(sort_by_position);

		// Define the slides of the map
		narra.slides = events.map(
			function (key) {
				var event = narra.events[key];

				// Set ID of timeline slide
				event.unique_id = "slide-" + event._id;

				// Parse dates from arrays
				var sDate = parseDate(event.start);
				var eDate = parseDate(event.end);


				// Set start date of timeline slide
				event.start_date = {
					'year': sDate.getFullYear(),
					'month': event.start.length > 5 ? sDate.getMonth() + 1 : "",
					'day': event.start.length > 8 ? sDate.getDate() : "",
				};

				// Set end date of timeline slide
				event.end_date = {
					'year': eDate.getFullYear(),
					'month': event.end.length > 5 ? eDate.getMonth() + 1 : "",
					'day': event.end.length > 8 ? eDate.getDate() : "",
				};


				event.date = sDate.getFullYear() + "-" + eDate.getFullYear();

				var fragment = "";
				var source;
				var secondaryAppend = "";
				var primaryAppend = "";
				var entitiesList = [];

				event.text = {
					'headline': event.title,
					'text': event.description ? event.description : ""
				};

				event.location = {

					"name": "",
					"lat": parseFloat(event.latitud),
					"lon": parseFloat(event.longitud),
					"zoom": 10,
					"line": true

				};

				// Function to link to English or Italian Wikipedia
				function createLinkWithTooltip(qid, lang) {

					var linkIri;

					if(qid.startsWith("Q")){
						linkIri = "https://www.wikidata.org/wiki/" + narra.items[qid]['_id'];
					} else {
						linkIri = "https://tool.dlnarratives.eu/CustomEntity/?idU="+qid+"&user="+narra.user+"&idN="+narra.id_n+"&subject="+narra.subjectID;
					}

					return "<a onmouseover='$(this).tooltip(); $(this).tooltip(\"show\")' data-toggle='tooltip' title='" + getDescription(qid) + "' target='_blank' target='_blank' href='"+linkIri+"'>" + narra.items[qid][lang + 'Name'] + "</a>";
				}

				// Get list of entities and link to Wikipedia
				for (var qid in event.props) {

					var prop = event.props[qid];

					if (qid !== undefined && qid in narra.items) {
						//en entities
						if (narra.currentLang == "en") {
							if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							} else if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							}
						// it entities
						} else {
							if ("itName" in narra.items[qid] && narra.items[qid].itName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "it"));
							} else if ("enName" in narra.items[qid] && narra.items[qid].enName !== "") {
								entitiesList.push(createLinkWithTooltip(qid, "en"));
							}
						}
					}

					// Handle event images (or other media)
					if (prop !== undefined) {

						// load media of event if any
						if (event.eventMedia != "") {

							event.media = {'url' : event.eventMedia, 'caption' : event.eventMediaCaption};

						// else load entities images
						} 
/* 						else {

							if (event.media && event.media.url && event.media.url.startsWith('data')) {
								event.media = undefined;
							}

							if (event.media === undefined) {

								if (narra.items[qid] !== undefined && 'image' in narra.items[qid] && ! (qid in narra.usedImages)) {

									var image = narra.items[qid].image;

									if (image.startsWith("http")) {
										event.media = {'url': narra.items[qid].image
											.replace('http:', 'https:')
											.replace('Special:FilePath', 'Special:Redirect/file')
											.replace('/wiki/', '/w/index.php?title=')};
										narra.usedImages[qid] = true;

										if (event.media && "url" in event.media && event.media.url.indexOf('/w/index.php?title=') > -1) {
											event.media.url = event.media.url + '&width=700&type=.jpg';
										}
									}
								}
							}

						} */

						var j;

						// Handle secondary sources of events
						if ('secondary' in prop && prop.secondary.length > 0) {
							for (j = 0; j < prop.secondary.length; j++) {
								if (!event.text.text && prop.secondary[j].text) {
									event.text.text = prop.secondary[j].text;
								}
								if (prop.secondary[j].title) {
									source = '\<li>' + prop.secondary[j].author + ', ' + prop.secondary[j].title;
									if (prop.secondary[j].reference != "") {
										source += ", " + prop.secondary[j].reference;
									}
									source += '\</li>';
									if (secondaryAppend.indexOf(source) < 0) {
										secondaryAppend += source;
									}
								}
							}
						}

						// Handle primary sources of events
						if ('primary' in prop && prop.primary.length > 0) {
							for (j = 0; j < prop.primary.length; j++) {
								if (prop.primary[j].title) {
									source = '\<li>' + prop.primary[j].author + ', ' + prop.primary[j].title;
									if (prop.primary[j].reference != "") {
										source += ", " + prop.primary[j].reference;
									}
									source += '\</li>';
									if (primaryAppend.indexOf(source) < 0) {
										primaryAppend += source;
									}
								}
							}
						}
					}
					if (fragment.length > 0) break;
				}

				// Set event text
				event.text.text += fragment;
				var textToAppend = "";

				// Function to make a list of digital objects
				function makeDigObjList(urls) {
					var results = [];
					var l;
					var a;

					//if digital objets is array of objects (url + title))
					if (urls && $.type(urls) === "array" && $.type(urls[0]) === "object") {

						for(l = 0; l < urls.length; l++) {
							a = document.createElement("a");
							a.setAttribute("href", urls[l].url);
							a.setAttribute("target", "_blank");
							a.text = urls[l].title;
							results.push(a.outerHTML);
						}

					//if digital objets are old (only array of URLs)
					} else if (urls && $.type(urls) === "array") {
						for (l = 0; l < urls.length; l++) {
							a = document.createElement("a");
							a.setAttribute("href", urls[l]);
							a.setAttribute("target", "_blank");
							a.text = l + 1;
							results.push(a.outerHTML);
						}
					} else if (urls && $.type(urls) === "string") {
						a = document.createElement("a");
						a.setAttribute("href", urls);
						a.setAttribute("target", "_blank");
						a.text = "1";
						results.push(a.outerHTML);
					}
					return results.join(" • ");
				}

				// Display digital object list
				var digObjList = makeDigObjList(event.objurl);

				// Append secondary sources to HTML
				if (secondaryAppend)
					textToAppend += '<h5>Secondary Sources</h5><ul>' + secondaryAppend + '</ul>';

				// Append primary sources to HTML
				if (primaryAppend) {
					textToAppend += '<h5>Primary Sources</h5><ul>' + primaryAppend + '</ul>';
				}

				// Append list of entities to HTML
				if (entitiesList) {
					textToAppend += '<h5>Entities</h5><span class="tl-entities">' + entitiesList.join(' • ') + '</span>';
				}

				// Append list of digital objects to HTML
				if (digObjList) {
					textToAppend += '<h5>Digital Objects</h5><span class="digObjList">'
						+ digObjList + '</span>';
				}

				// Set final event text
				if (textToAppend) {
					event.text.text += textToAppend;
				}

				return event;
			}
		);

	var slidesObject= {"slides": narra.slides, "items" : narra.items, "events": narra.events, "A1": narra.info};

	var baseUrl= window.location.host;

	// if is not a preview and user want to publish
	if (preview == 0) {
		$("#publish-story-container span").hide();
		$("#loading").fadeIn();

		$.ajax({
			type: "POST",
			url: "PHP/publishAndTriplifyNarration.php",
			dataType: "JSON",
			data: {user : narra.user, narrationTitle : title, slides : JSON.stringify(slidesObject), idNarr: narra.id_n, subject: narra.subjectID, baseURL: baseUrl},
			success: function(resp) {

				$("#loading").hide();
				$("#publish-story-container span").fadeIn();
				console.log(resp.output);

				var searchOtherNarratives;

				if (window.location.host=="dlnarratives.moving.d4science.org") {
					searchOtherNarratives = "<br/><br/>Find all stored narratives: <input type='text' value='https://dlnarratives.moving.d4science.org/Search/' readonly>";
				} else {
					searchOtherNarratives = "<br/><br/>Find all stored narratives: <input type='text' value='https://tool.dlnarratives.eu/Search/?dataset=narratives' readonly>";
				}

				showModal(
					"Narrative published",
					"Your narrative has been published and stored in the Fuseki Triplestore.<br/><br/>Storymap Link: <input type='text' value='"+resp.link+"?visualization=map' readonly><br/><br/>Timeline Link: <input type='text' value='"+resp.link+"?visualization=timeline' readonly>" + searchOtherNarratives,
					"back",
					"ok",
					function() {
					},
					function() {
					}
				);

			},
			error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

			}

		});

	// if is a preview
	} else if (preview == 1) {

 		$.ajax({
			type: "POST",
			url: "PHP//saveTempJsonPreviewStorymap.php",
			dataType: "JSON",
			data: {user : narra.user, narrationTitle : title, slides : JSON.stringify(slidesObject), idNarr: narra.id_n, subject: narra.subjectID, baseURL: baseUrl},
			success: function() {
				window.open("horizontalstorymap3DProva/previewStorymap.php?user="+narra.user+"&id=N"+narra.id_n+"&preview=1", '_blank').focus();
			},
			error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

			}

		});

	}

}

// Switch event image
function switchImage(value, slideID) {
    var evid = slideID.split('slide-')[1];
    narra.events[evid].media = {};
    narra.events[evid].media.url = value;
    saveObjectToDB(narra.events, evid);
    $("#" + slideID + " " + ".tl-media-image").attr("src", value);
}
            
// Make image selection menu
function makeImageSelect(slideID) {

	var idevent = slideID.split('slide-')[1];

	//select images only if it isn't a eventMedia
	if (narra.events[idevent].eventMedia == "") {
		
		console.log(narra.events[idevent].eventMedia);
		var $select = $("<select onchange='switchImage($(this).val(), \"" + slideID + "\")'>");

		$.each(window.timeline.getSlideById(slideID).data.props, function(p) {
			var evid = slideID.split('slide-')[1];
			if (narra.items[p] && "image" in narra.items[p] && narra.items[p].image !== "") {
				var selected = "";
				var fixedImageURL = narra.items[p].image.replace('http:', 'https:').replace('Special:FilePath', 'Special:Redirect/file').replace('/wiki/', '/w/index.php?title=');
				if ("media" in narra.events[evid] && narra.events[evid].media.url === fixedImageURL) {
					selected = " selected ";
				}
				$select.append("<option value='" + fixedImageURL + "'" + selected + ">" + narra.items[p].enName + " image</option>");
			}
		});

		$("#" + slideID + " " + ".tl-media > select").remove();
		$("#" + slideID + " " + ".tl-media").append($select);
	
	}
}

// Hide search field
function hideSearch() {
    if ($("#searchInput").is(':visible')) {
        $('#searchInput').slideUp(200);
        $('.checkbox').slideUp(200);
    }
}

// Search entities
function searchEntity() {

	var insertedValue = $("#searchInput").val();

	var activeClass = $("#leftNav").children(".add-button-active-entities");

	if (activeClass.length) {
		entityClass = activeClass.attr("data-class");
	} else {
		$("#allButton").toggleClass("add-button-active-entities");
	}

	if (entityClass == '' || entityClass == undefined) {
		entityClass = 'all';
	}

	var dataContainer = $("#data-container");

	// display search results
	if (dataContainer.css("display") == "none") {
		dataContainer.show();
		$("#entities-not-selected").hide();
	}
    if (insertedValue === "") {
        $("#controls .data:contains(" + insertedValue + ")").filter("[data-class='" + entityClass + "']").show();
    }
    else {
        $("#controls .data").hide();
    }

	// search filter based on the class chosen by the user (by clicking on it)
	if (entityClass == 'all' || entityClass == '' || entityClass == undefined) {
		$("#controls .data:contains(" + insertedValue + ")").show();
	} else {
		$("#controls .data:contains(" + insertedValue + ")").filter("[data-class='" + entityClass + "']").show();
	}

}

// Get images from Wikimedia Commons (through Wikipedia)
function imageRequest(qid, caller) {
    var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=images|imageinfo&imlimit=50&format=json&iiprop=extmetadata&titles=' + encodeURIComponent(narra.items[qid].enName.replace(/\s+/g, '_')) + '&callback=?';
    
    $.getJSON(url, function(data) {
        var html = "";
        if ("query" in data && "pages" in data.query) {
            var pages = data.query.pages;
            var images = pages[Object.keys(pages)[0]].images;
        
            if (images !== undefined) {
                for (var i = 0; i < images.length; i++) {
                    if (images[i].title.indexOf('Commons-logo') > 0) continue;
                    if (images[i].title.indexOf('Disambig') > 0) continue;
                    if (images[i].title.indexOf('Red Pencil Icon') > 0) continue;
                    if (images[i].title.indexOf('Wikisource') > 0) continue;
                    if (images[i].title.indexOf('Wikivoyage') > 0) continue;
                    if (images[i].title.indexOf('Wiktionary') > 0) continue;
                    if (images[i].title.indexOf('A_coloured_voting_box') > 0) continue;
                    if (images[i].title.indexOf('Emblem-money') > 0) continue;
                    if (images[i].title.indexOf('Folder Hexagonal') > 0) continue;
                    if (images[i].title.indexOf('.svg') > 0) continue;
                    if (images[i].title.indexOf('.ogv') > 0) continue;
                    if (images[i].title.indexOf('.ogg') > 0) continue;

					var imageURL = "https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/" + encodeURIComponent(images[i].title.replace(/\s+/g, '_').split('File:')[1]) + "&width=700&type=.jpg";
            
                    html += "<div class='square' style='background-image: url(" + imageURL + ")' onclick='replaceImage($(event.target))'></div>";
                }
            }
        }
        html += "<div class='square'><input class='fileInput' type='file' name='files[]' style='display: none' onchange='loadImageFromFile(event.target)'/><span onclick='$(event.target).parent().children(\"input\").first().click()'>Upload from disk</span></div>";
        caller.parent().next().html(html);        
    });
}

function loadImageFromFile(element) {
	var file = element.files[0];
	
	if (file) {
		if (file.type.match(/image.*/)) {
			var extension = file.type.split('/')[1].replace('jpeg', 'jpg');
			var fileName = narra.id_n +"-"+ narra.user  + "-image-" + Math.floor(Math.random() * 10000000) + "." + extension;

			$(element).parents('.ui-front').find('.popoverImage').hide();
			$(element).parents('.ui-front').find('.image-upload-spinner').show();
			
			if (file.type.indexOf('gif') > -1) {
				uploadImage(element, file, fileName);
			} else {
				ImageTools.resize(file, {
						width: 1280, // maximum width
						height: 1024 // maximum height
					}, function(blob, didItResize) {
						if (didItResize) {
							console.log(currentTime() + 'Resized image to maximum allowed size');
						}
						uploadImage(element, blob, fileName);
					}
				);
			}
		} else {
			fadeout('failed-upload-image', 2500);
		}
	}
}

function uploadImage(element, blob, fileName) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/PHP//uploadImage.php', true);
	var formData = new FormData();
	formData.append("file", blob);
	formData.append("fileName", fileName);
	xhr.send(formData);

	xhr.onreadystatechange = function() {
		// TODO Handle duplicate images to save space on server
	    if (xhr.readyState == XMLHttpRequest.DONE) {
			console.log(xhr.responseText);
			$(element).parents('.ui-front').find('.image-upload-spinner').hide();
			console.log(currentTime() + 'Uploaded image: ' + fileName);
	        replaceImage($(element), "https://tool.dlnarratives.eu/images/" + fileName);
			$(element).parents('.ui-front').find('.popoverImage').show();
	    } else {
	    	// TODO Handle server error
	    }
	}
}

function replaceImage($element, withImage) {
	var qid = $element.parents('.ui-front').attr('data-id');
	if (withImage === undefined) {
		withImage = $element.css('background-image').split('"')[1];
	}
	$element.parents('.ui-front').find('.popoverImage').attr('src', withImage).show();
	$element.parents('.ui-front').find('.popoverImageSeparator').show();
	$element.parents('.ui-front').find('.imageLabelDiv > a').text('Change Image');
	narra.items[qid].image = withImage;
	saveObjectToDB(narra.items, qid);
}

// Ask user to confirm digital object deletion
function confirmDeleteDigObj(url) {
    showModal(
        "Delete Digital Object",
        "Are you sure you want to delete this digital object?",
        "Keep Object",
        "Delete Object",
        function() {
        },
        function() {
            $("#digobjTable .digobjPreview[data-url='" + url + "']").parents("a").remove();
        }
    );
}

// Create preview for digital object
function createDigObjPreview(urlObj, title) {
    var regex = /<title>(.*?)</;
    
    if ($("#digobjTable .digobjPreview[data-url='" + urlObj + "']").length === 0) {
        
        var $preview = $("<a target='_blank' href='" + urlObj + "'><div class='digobjPreview' data-url='" + urlObj + "'><div class='deleteButton digObjDeleteButton'><b class='x'>×</b></div><span style='display: table-cell; vertical-align: middle;'>"+title+"</span></div></a>");
        
        $preview.mouseenter(function () {
            $(this).find(".deleteButton").fadeToggle("fast");
        });

        $preview.mouseleave(function () {
            $(this).find(".deleteButton").fadeToggle("fast");
        });
                
        $preview.find(".deleteButton").click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            confirmDeleteDigObj($(this).parent().attr("data-url"));
        });
        
        $("#digobjTable").append($preview);

		if (title == "") {
			 $.get( "PHP//getDigitalObjectPageForCorsP.php",
					 "urlob=" + urlObj	,
				  function(data) {
					  console.log(data);
					  var match = data.html.match(regex);
					  if (match !== null) {
						  $("#digobjTable .digobjPreview[data-url='" + urlObj + "'] span").text(match[0].split(">")[1].split("<")[0]);
					  }
				  },
				  "JSON"
			).fail(function() {
				console.log('ajax for Digital object not loaded'); // or whatever
			});
		}
		
    }
}

// Add new digital object
function addDigitalObject(inputValue, inputValue2, auto) {
    try {
        var url = new URL(inputValue); 
        $('#digobjInput').val("");
        $("#digobjInput").parents('.input-group').removeClass("has-error");
        $('#digobjTitle').val("");
		$("#digobjTitle").parents('.input-group').removeClass("has-error");
		
		createDigObjPreview(url, inputValue2);
    } catch (TypeError) {
        if (inputValue.indexOf("http://") < 0) {
            addDigitalObject("http://" + inputValue, inputValue2, auto);
        } else if (!auto) {
            $("#digobjInput").parents('.input-group').addClass("has-error");
			$("#digobjTitle").parents('.input-group').addClass("has-error");
        }
    }
}

// Confirm logout
function confirmLogout() {
    showModal(
        "Logout",
        "Do you really want to logout? You will lose all unsaved data.",
        "Don't Logout",
        "Logout",
        function() {
        },
        function() {
			
			$.ajax({
				type: "POST",
				url: "PHP//sessionClose.php",
				dataType: "JSON",
				data: {},
				success: function(resp) {
					console.log(resp.msg);
					console.log(currentTime() + "Successfully logged out");
					window.open("https://tool.dlnarratives.eu/index.html","_self");
				},
				error: function(response){
					var a= JSON.stringify(response);
					console.log(a);

				}
				
			});
			
        }
    );
}

// Confirm go to homepage
function confirmHome() {
    if (!workspaceIsEmpty()) {
		showModal(
			"Go to Homepage",
			"Do you want to go back to the homepage? You will lose all unsaved data.",
			"Stay Here",
			"Go to Homepage",
			function() {
			},
			function() {
				window.open("index.html","_self");
			}
		);
	} else {
		window.open("index.html","_self");
	}
}

// Show popover for digital object
function showDigObjImage(obj) {
    var url = obj.getAttribute("href");

    if (url.indexOf("europeana.eu") > -1) {
        var ids = url.split("record/")[1].split(".html")[0];
        $.getJSON("http://www.europeana.eu/api/v2/record/" + ids
        + ".json?wskey=UopBP64R3", function(data) {
            data.object.title;
            data.object.europeanaAggregation.edmPreview;
        });
    }

}

// Call triplifier and display results
function startTriplify() {
   
	$.ajax({
		type: "POST",
		url: "PHP//triplify.php",
		dataType: "JSON",
		data: {currentDbName: narra.id_n + narra.user +"-"+narra.dbName, idNarration: "N" + narra.info.id},
		success: function(resp) {
			console.log(resp.en)
			$("#loading").hide();
			$("#publish-story-container span").fadeIn();
			showModal(
				"Triplification Results",
				resp.id + "<br/>" + resp.numberEvents + "<br/>"+  resp.consistent +
				"<br><a target='_blank' href='" + resp.pathFileOwl + "'>Download the OWL file of your narrative</a><br><hr>🚧 <b>Work in Progress</b> 🚧<br><i>Soon you will be able to easily publish the narrative and its visualizations.</i>",
				"Cancel",
				"OK",
				function() {},
				function() {}
			);

		},
		error: function(response){
			var a= JSON.stringify(response);
			console.log(a);

		}
	});

}

// Triplify the narrative
function triplify() {
    $("#publish-story-container span").hide();
    $("#loading").fadeIn();
    performance.now();
	
	$.ajax({
		type: "GET",
		url: "PHP//A1forTriplify.php",
		dataType: "JSON",
		data: {dbusername: narra.id_n + narra.user +'-'+narra.dbName},
		success: function(resp) {

			// Load narrative info from database
			if (resp.info != "") {

				narra.info = JSON.parse(resp.info);
				console.log(currentTime() + 'Load Narrative info (A1) From DB: ' + narra.info);
				startTriplify();

			} else {

				console.log(currentTime() + 'Narrative info not found in database; will create and save in DB');
				narra.info = {
					_id: "A1",
					id: Math.round(Math.random() * 1000000000),
					name: "",
					author: narra.user
				};
				saveObjectToDB({"A1": narra.info}, "A1");
				startTriplify();

			}
		},
		error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

		}
	});

}

// Make query for entity
function makeQueryForDBName(qids) {
    var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
    "wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 " +
    "wd:Q15474042 wd:Q4167836 wd:Q41176 wd:Q8205328 wd:Q5127848\n}";

	return "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
		"SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc " +
		"\nWHERE {\n" +
		"VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
		types +
		"?uri wdt:P31 ?class.\n" +
		"?class wdt:P279* ?type.\n" +
		"OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
		"OPTIONAL { ?uri schema:description ?enDesc filter (lang(?enDesc) = 'en'). }\n" + "\n\}";
}

// Perform SPARQL request for each entity
function dbNameRequest(qids) {

    var query = makeQueryForDBName(qids);

    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

    $.getJSON(sparqlURL, function (data) {    
        var added = {};
        data = data["results"]["bindings"];
        for (var i=0; i < data.length; i++) {
            var qid = data[i].uri.value.split('/').pop();
            if (!(qid in added)) {
                $("#narratives-menu").append("<li class='narra-list-item'><a href='tool.html?" + qid + "' class='data' target = '_blank'>" + titlecase(data[i].enName.value) + "</a></li>");
                added[qid] = {};
        	}
        }
    });
}

function deleteNarrative(ids){
	const arrayOfidsForDeleting = ids.split("-");

    showModal(
        "DELETE NARRATIVE",
        "</br><b>WARNING: </b> you are about to permanently delete the narration <i>"+arrayOfidsForDeleting[3]+"</i> from database. Do you want to continue?",
        "Don't delete",
        "Delete",
        function() {
        },
        function() {

			$.ajax({
				type: "POST",
				url: "PHP//deleteNarration.php",
				dataType: "JSON",
				data: {subject: arrayOfidsForDeleting[1], user: arrayOfidsForDeleting[2], id: arrayOfidsForDeleting[0] },
				success: function() {

					window.location.href ="index.html";

				},
				error: function(response){
						var a= JSON.stringify(response);
						alert(a);

				}

			});
		}
    );
	
}

function openPopupMap(){
	
	window.open("HTML/searchCoordinates.html", "Search_Coordinates", "width=900,height=700");

}

function monthNameByNumber(monthNumber){
	
	var textMonth;
	
	if (narra.currentLang == "en") {
		
		switch(monthNumber) {
			case '1':
			case '01':
				textMonth = "January";
				break;
			case '2':
			case '02':
				textMonth = "February";
				break;
			case '3':
			case '03':
				textMonth = "March";
				break;
			case '4':
			case '04':
				textMonth = "April";
				break;
			case '5':
			case '05':
				textMonth = "May";
				break;
			case '6':
			case '06':
				textMonth = "June";
				break;
			case '7':
			case '07':
				textMonth = "July";
				break;
			case '8':
			case '08':
				textMonth = "August";
				break;
			case '9':
			case '09':
				textMonth = "September";
				break;
			case '10':
				textMonth = "October";
				break;
			case '11':
				textMonth = "November";
				break;
			case '12':
				textMonth = "December";
				break;
			default :
				textMonth = monthNumber;
				break;
			
		}
	
	} else {

		switch(monthNumber) {
			case '1':
			case '01':
				textMonth = "gennaio";
				break;
			case '2':
			case '02':
				textMonth = "febbraio";
				break;
			case '3':
			case '03':
				textMonth = "marzo";
				break;
			case '4':
			case '04':
				textMonth = "aprile";
				break;
			case '5':
			case '05':
				textMonth = "maggio";
				break;
			case '6':
			case '06':
				textMonth = "giugno";
				break;
			case '7':
			case '07':
				textMonth = "luglio";
				break;
			case '8':
			case '08':
				textMonth = "agosto";
				break;
			case '9':
			case '09':
				textMonth = "settembre";
				break;
			case '10':
				textMonth = "ottobre";
				break;
			case '11':
				textMonth = "novembre";
				break;
			case '12':
				textMonth = "dicembre";
				break;
			default :
				textMonth = monthNumber;
				break;
		
		}
	
	}
	
	return textMonth;

}

function getGeometryCenter(wkt) {
	wkt.includes('MULTIPOLYGON');

	// Remove the "POLYGON" or "MULTIPOLYGON" prefix from the WKT format
	var coordinates = wkt.replace(/POLYGON|MULTIPOLYGON/g, '').trim();

	// Remove spaces between the keyword and the parentheses
	coordinates = coordinates.replace(/\(\s*|\s*\)/g, '');

	// Remove spaces after commas
	coordinates = coordinates.replace(/\s*,\s*/g, ',');

	// Remove the brackets and separate the polygons
	var polygons = coordinates.split('),');

	var totalPoints = 0;
	var sumX = 0;
	var sumY = 0;

	// Calculate the average coordinates for each polygon
	polygons.forEach(function (polygon) {
		// Remove the brackets and separate the coordinates
		var coords = polygon.split(',');

		// Calculates the sum of coordinates for the current polygon
		coords.forEach(function (coord) {
		  var point = coord.trim().split(' ');
		  var x = parseFloat(point[0]);
		  var y = parseFloat(point[1]);

		  sumX += x;
		  sumY += y;
		  totalPoints++;
		});
	});

	// Calculate global average coordinates
	var centerX = sumX / totalPoints;
	var centerY = sumY / totalPoints;

	// Return latitude and longitude as numbers
	return [centerY, centerX];
}

function downloadOwl(){

	$.ajax({
        url: "../tool.dlnarratives.eu/PHP/downloadOwl.php",
		type: "GET",
		dataType: "JSON",
		data: {user:narra.info.author, id:narra.info.id},
		success: function(resp) {

			if (resp.fileExists == 1) {
				window.open("https://tool.dlnarratives.eu/owl/narratives/"+narra.info.author+"_N"+narra.info.id+".owl", '_blank').focus();
			} else {

				fadeout('failed-owl', 2000);

			}
		},
		error: function(response){
				var a= JSON.stringify(response);
				console.log(a);

		}

	});

}

function hideEntityPopover() {
	$("#secondChoice").css("visibility", "hidden");
	$("#entity-content").css("visibility", "hidden");
	$("#uri-div").css("visibility", "hidden");
	$("#div-entity-btn").css("visibility", "hidden");
}

function resetEntityPopover() {
	$('#newEntityName').val('');
	$('#newEntityDesc').val('');
	$('#newEntityType').prop('selectedIndex', 0);

	$("#uri-radio").prop('checked', false);
	$("#manual-radio").prop('checked', false);
}

function addEntityListener(thisSelectedInput) {
	hideEntityPopover();

	if ($(thisSelectedInput).attr("value") == "uri") {
		$("#entity-content:not(#secondChoice)").css("visibility", "visible");
		$("#uri-div").css("visibility", "visible");
	} else if ($(thisSelectedInput).attr("value") == "manual") {

		$("#entity-content").css("visibility", "visible");
		$("#secondChoice").css("visibility", "visible");
		$("#div-entity-btn").css("visibility", "visible");
	}
}

function addRadioListener(thisSelectedVideo) {
	$(thisSelectedVideo).click(function() {
		if ($(thisSelectedVideo).attr("value") == "image") {
			// switch off video section
			$(".video-caption-group").css("display", "none");

			$(".image-caption-group").css("display", "table");
			$("#add-image").css("display", "flex");
		} else {
			// switch off image section(s)
			$(".image-caption-group").css("display", "none");
			$("#add-image").css("display", "none");

			$(".video-caption-group").css("display", "block");
		}
	});
}

function addCoorsListener(thisSelectedCoors) {
	$(thisSelectedCoors).click(function() {
		if ($(thisSelectedCoors).attr("value") == "point") {
			// switch off polygon section
			$("#polygonArea").removeClass("has-error-coors");
			$("#polygon").css("display", "none");

			$("#coors-map").css("display", "flex");
		} else {
			// switch off coors section
			$("#latitud").removeClass("has-error-coors");
			$("#longitud").removeClass("has-error-coors");
			$("#coors-map").css("display", "none");

			$("#polygon").css("display", "flex");
		}
	});
}

function addTooltipListener(thisSelectedTooltip) {
	// the first serves as activator...
	$('[data-toggle="tooltip"]').tooltip({
		animated: 'fade',
		placement: 'auto',
		trigger: 'click'
	});

	// ... the second serves as listener
	$(thisSelectedTooltip).click(function() {
		$('[data-toggle="tooltip"]').tooltip({
			animated: 'fade',
			placement: 'auto',
			trigger: 'click'
		});
	});
}

// Set onchange event on image event uploading
function addBackgroundImageListener(thisSelectImage) {

	$(thisSelectImage).on("change", function(){

		var thisSelectEventLocalImage = $(thisSelectImage).siblings('.button-background-image-div').children('.selectEventLocalBackgroundImage');

		if ($(thisSelectImage).prop('files')[0] != undefined) {

			var fileType = $(thisSelectImage).prop('files')[0].type;
			var validImageTypes = ["image/gif", "image/jpeg", "image/png"];

			// if file is not an image
			if ($.inArray(fileType, validImageTypes) < 0) {

				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image");
				$(thisSelectImage).val("");

				fadeout('image-type-error', 1300);

			// if file is larger than 2 mb
			} else if ($(thisSelectImage).prop('files')[0].size > 2000000) {

				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image");
				$(thisSelectImage).val("");

				fadeout('image-size-error', 1300);

			} else {

				// file ok
				var imgName = $(thisSelectImage).prop('files')[0].name;
				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image: " + imgName);

			}
			
		} else {
			$(thisSelectEventLocalImage).empty();
			$(thisSelectEventLocalImage).text("Upload image");
		}

	});
}

// Set onchange event on image event uploading
function addImageListener(thisSelectImage) {

	$(thisSelectImage).on("change", function(){

		var thisSelectEventLocalImage = $(thisSelectImage).siblings('.button-image-div').children('.selectEventLocalImage');

		if ($(thisSelectImage).prop('files')[0] != undefined) {


			var fileType = $(thisSelectImage).prop('files')[0].type;
			var validImageTypes = ["image/gif", "image/jpeg", "image/png"];

			// if file is not an image
			if ($.inArray(fileType, validImageTypes) < 0) {

				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image");
				$(thisSelectImage).val("");

				fadeout('image-type-error', 1300);

			// if file is larger than 2 mb
			} else if ($(thisSelectImage).prop('files')[0].size > 2000000) {

				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image");
				$(thisSelectImage).val("");

				fadeout('image-size-error', 1300);

			} else {

				// file ok
				var imgName = $(thisSelectImage).prop('files')[0].name;
				$(thisSelectEventLocalImage).empty();
				$(thisSelectEventLocalImage).text("Upload image: " + imgName);

			}

		} else {
			$(thisSelectEventLocalImage).empty();
			$(thisSelectEventLocalImage).text("Upload image");
		}

	});
}

function addImageGroup(fromLoadEvent, media = '', caption = '') {
	var source = $('#image-caption-group'),
		clone = source.clone();

	// increment all IDs of divs
	clone.find('div').attr('id', function (i, val) {
		return val + countImageGroup;
	});

	// increment all IDs of inputs
	clone.find('input').attr('id', function (i, val) {
		return val + countImageGroup;
	}).val("");

	// increment all IDs of buttons
	clone.find('button').attr('id', function (i, val) {
		return val + countImageGroup;
	});

	// increment ID of main div
	clone.attr('id', function (i, val) {
		return val + countImageGroup;
	});

	// append a button (inside a span) which allows users to remove image sections
	clone.append(
		'<span class="remove-image-container" style="display: table-cell; vertical-align: middle; position: relative; width: 1%; padding: 5px 0 0 5px">' +
		'	<button class="btn btn-default remove-image" type="button" onclick="removeImage(this);"><i class="fa-solid fa-minus"></i> Remove image</button>' +
		'</span>');
	clone.find('.remove-image-container').siblings().css({"display": "table-cell", "float": "left", "position": "relative", "width": "100%"})
		.parent().css("display", "table");

	var uploadImageBtn = clone.find('.selectEventLocalImage');
	var inputImage = clone.find('.eventImageInput');

	// clear both values
	uploadImageBtn.text("Upload image");
	inputImage.val();


	// remove onclick attribute obtained from source
	uploadImageBtn.attr("onclick", "document.getElementById('" + inputImage.attr('id') + "').click();");

	addImageListener(inputImage);

	// if the function is called by loadEvent() then retrieve saved values
	if (fromLoadEvent) {
		clone.find('input.eventMedia').val(media);
		clone.find('input.eventMediaCaption').val(caption);
	}

	clone.insertAfter($('.image-caption-group:last'));

	countImageGroup++;
}

function removeImage(buttonCaller) {
	$(buttonCaller).parent().parent().remove();
}

function copyToClipboard(whatToCopy, idk, thisButton) {

	// search the coordinates in narra.items
	var coorsFound;
	if (whatToCopy == 'pol') {
		coorsFound = narra.items[idk].coordinatesPolygon;
	} else if (whatToCopy == 'lat') {

		coorsFound = narra.items[idk].coordinatesPoint;
		var matches = coorsFound.match(/-?\d+(\.\d+)?/g);
		if (matches && matches.length >= 2) {
			coorsFound = matches[1];
		} else {
			console.log("Latitude not found");
		}

	} else if (whatToCopy == 'long') {

		coorsFound = narra.items[idk].coordinatesPoint;
		var match = coorsFound.match(/-?\d+(\.\d+)?/);
		if (match) {
			coorsFound = match[0];
		} else {
			console.log("Longitude not found");
		}

	} else {
		return;
	}

	// copy the coordinates to the clipboard
	navigator.clipboard.writeText(coorsFound);

	var thisButtonSelector = $("#" + thisButton);

	// open popover that confirms the copy

	// the first serves as activator...
	thisButtonSelector.popover({
        html: true,
        placement: "auto",
        container: "body",
        trigger: "manual",
		template: "<div class=\"popover small-popover\" role=\"tooltip\"><div class='arrow' style='left: 50%;'></div><div class='popover-content'></div></div>",
		content: "Copied!"
    });

	// ... while the second opens the popover
	if (!thisButtonSelector.attr('aria-describedby')) {
		thisButtonSelector.popover({
			html: true,
			placement: "auto",
			container: "body",
			trigger: "manual",
			template: "<div class=\"popover small-popover\" role=\"tooltip\"><div class='arrow' style='left: 50%;'></div><div class='popover-content'></div></div>",
			content: "Copied!"
		});
		thisButtonSelector.popover('show');

		// set timeout for automatically closing the popover
		setTimeout(function () {
			thisButtonSelector.popover('hide');
		}, 1000);
	}
}