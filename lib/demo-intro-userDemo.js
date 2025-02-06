
// Use ECMAScript strict mode
"use strict";

// Remote database
var db = {};

$(document).ready(function() {
    

	
    
	$.ajax({
		type: "GET",
		//url: "conn.php", 
		url: "../PHP/sessionDemo.php", 
		dataType: "JSON",					
		data: {},
		success: function(resp) {
			console.log(resp.username)
			if(resp.username != ""){
				
				
				$("#userName").text(resp.usernameToDisplayInMenu.toUpperCase());
               
				

				$("#userName").css("display","table");

				$("#userMenu").css("display","table");
				
				$('#userMenu').css({ 'right' : $('#userName').width() + 10 })
				$('.dropdown-menu-right').css({ 'right' : $('#userName').width() + 10 })
				$('.dropdown-menu-right').css({ 'top' : $('#userName').height() +10})
				
				
				
				console.log(currentTime() + "Logged in successfully as \"" + resp.usernameToDisplayInMenu + "\""); 
                
				
				var htmlTable=""
				htmlTable += "<thead> <tr> <th>Id</th> <th>Title</th> <th>Delete</th> </tr> </thead> <tbody>"				
				for(var i = 0; i < resp.jsonData.length; i ++) {
					

					htmlTable += "<tr>"
					htmlTable += "<td style='width:10%'>"+resp.jsonData[i][0]+"</td> <td style='width:80%'><a href='toolDemo.html?idwiki=" + resp.jsonData[i][2].toUpperCase() + "&idnar="+resp.jsonData[i][0]+"'>" + resp.jsonData[i][1] + "</a></td>"
					
					
  					var escapeTrash= resp.jsonData[i][1].replace(/'/g,"&rsquo;");
					escapeTrash= escapeTrash.replace(/-/g,"&ndash;");
					escapeTrash= escapeTrash.replace(/"/g,"&quot;"); 
					
					if(resp.jsonData[i][3]==null){
						htmlTable += "<td style='width:10%'> <button class='' id='"+resp.jsonData[i][0]+"-"+resp.jsonData[i][2]+"-"+resp.username+"-"+escapeTrash+"' onclick='deleteNarrative(this.id)'> <i class='fa fa-trash'></i> </button></td>" 
					
					} else {
					
						htmlTable += "<td style='width:10%'>can't delete</td>"
					} 
					
					htmlTable += "</tr>"
					
					
					$("#narratives-menu").append("<div class='narra-list-item' id='storyMenu"+i+"'><a href='toolDemo.html?idwiki=" + resp.jsonData[i][2].toUpperCase() + "&idnar="+resp.jsonData[i][0]+"' class='data' target = '_blank'>" + resp.jsonData[i][1] + "</a><div class='deleteButton' id='"+resp.jsonData[i][0]+"-"+resp.jsonData[i][2]+"-"+resp.username+"-"+escapeTrash+"' onclick='deleteNarrative(this.id)'> <b class='x'>×</b></div></div>");
					

					if(resp.jsonData[i][3]==null){
						$("#storyMenu" + i).mouseenter(function() {
							$(this).find('.deleteButton').fadeToggle("fast");
						});
						$("#storyMenu" + i).mouseleave(function() {
							$(this).find('.deleteButton').fadeToggle("fast");
						});
					}
				
				}
				htmlTable += "</tbody>"
				$("#dataTable").append(htmlTable)
				$("#dataTable").DataTable({
					order: [0, 'desc'],
					oLanguage: {
						sSearch: "Search your Narratives:"
					},
					language: {
						  emptyTable: "No narratives found in database"
					}
				})
				

					$("#narratives-menu").append('<a href="Search/?dataset=prova2"><li  class="dropdown-header">Search Other Narratives</li></a>')

				
				if (resp.jsonData.length > 0) {
					$("#userDBs").show();
				}
				
				$("#emptyDiv, #auth-div").hide();
				$("#introDiv").show();
					
				$('#auth-div').hide()
					
			} else {
				
				// if came from VRE (dlnarratives.moving.d4science.org)
				if(window.location.hostname == "dlnarratives.moving.d4science.org") {
					window.location.href = "https://moving.d4science.org/group/moving_storymaps"; 
				
				// if came from our login (tool.dlnarratives.eu)
				} else {
					window.location.href = "https://tool.dlnarratives.eu/"; 
					
				}
	
			}

					

					
			},
		error: function(response){
				var a= JSON.stringify(response)
				alert(a)

			}
		
	});
	
    // Open PouchDB remote database
    //db = new PouchDB("https://dlnarratives.eu/db/test", {skipSetup:true, ajax: {timeout: 60000,}});
    
    
    // Check if user is already logged in
/*     db.getSession(function (err, response) {
        if (err) {
            console.log(currentTime() + "Cannot login to remote database: ", err);
        } else if (!response.userCtx.name || response.userCtx.name === "guest") {
            db.logout();
            console.log(currentTime() + "User needs to login");
            
            $("#auth-div").show();
        } else {
            console.log(currentTime() + "Logged in to remote database as \"" + response.userCtx.name + "\"");
                        
            $("#userMenu").text(response.userCtx.name.toUpperCase()).show();
            
            $("#home, #userMenu, .top-btn").show();
            
            db.info()
            .then(function (result) {
                console.log(currentTime() + "Remote database is accessible");
                $.getJSON("https://dlnarratives.eu/db/_all_dbs", function(data) {
                    var DBsToLoad = [];
                    
                    for (var i = 0; i < data.length; i += 1) {
                          if (data[i].startsWith(response.userCtx.name + "-q")) {
                            DBsToLoad.push(data[i].split("-")[1].toUpperCase());
                          }
                      }
                    sparqlRequest(DBsToLoad);
                });
            })
            .catch(function (err) {
                console.log.bind(console);
            });
        }
    }); */
    
    $("#auth-form").bind("submit", function (event) {
        event.preventDefault();
        authenticate($("#inputName").val(), $("#inputPassword").val());
    });
    
    // Set click event on logout button
    /*
    $("#userMenu").click(function() {
        showUserMenu();
    });
    */
    
    var suggestions = new Bloodhound({
      datumTokenizer: function(results) {
        return Bloodhound.tokenizers.whitespace(results);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=%QUERY&language=en&limit=10&format=json&callback=?',
                wildcard: '%QUERY',
        filter: function(response) {
          return response.search;
        }
      }
    });

    suggestions.initialize();

    $('.typeahead').typeahead({
      hint: false,
      highlight: false,
      minLength: 3,
    }, {
      name: 'suggestions',
        limit: 10,
      displayKey: function(suggestions) {
          var desc = suggestions.description;
          var finalString = suggestions.label + (desc !== undefined ? ' (' + desc + ')' : '');
        return finalString;
      },
      source: suggestions.ttAdapter()
    });
    
    $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
        $(this).blur();
        $(this).val('');
        $('#back').css('visibility', 'hidden');
        document.getElementById('topDiv').style.height = '56%';            
        window.open('toolDemo.html?idwiki=' + suggestion.id, "_self");
    });
});

function confirmLogout() {
    showModal(
        "Logout",
        "Do you really want to logout?",
        "Don't Logout",
        "Logout",
        function() {
        },
        function() {
/*             db.logout().then(function () {
                console.log(currentTime() + "Successfully logged out");
                window.open("/tool/demo.html","_self");
                $("#userMenu").hide();
            }); */
			
			
			$.ajax({
				type: "POST",
				url: "../PHP/sessionClose.php", 
				dataType: "JSON",					
				data: {},
				success: function(resp) {
					console.log(resp.msg)
					console.log(currentTime() + "Successfully logged out");
					window.open("demo.html","_self");
				},
				error: function(response){
					var a= JSON.stringify(response)
					alert(a)

				}
				
			})
			
			
        }
    );
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



// Return current time
function currentTime() {
    var d = new Date();
    return d.toISOString().split("T")[1].replace("Z", "") + " -- ";
}

// Make query for entity
function makeQuery(qids) {
    var types = "VALUES ?type {\n wd:Q15222213 wd:Q17334923 wd:Q43229 wd:Q8436 wd:Q488383 " +
    "wd:Q7184903 wd:Q386724 wd:Q234460 wd:Q5 wd:Q186081 wd:Q1190554 " +
    "wd:Q15474042 wd:Q41176 wd:Q8205328 wd:Q5127848\n}";
    
    var query = "PREFIX wd: <http://www.wikidata.org/entity/>\n" +
        "SELECT DISTINCT ?uri ?type ?itName ?enName ?itDesc ?enDesc ?image " +
        "?birth ?death ?foundation ?foundation2 ?completion ?occupation ?position" +
        "\nWHERE {\n" +
        "VALUES ?uri {wd:" + qids.join(" wd:") + "}\n" +
        types +
        "?uri wdt:P31 ?class.\n" +
        "?class wdt:P279* ?type.\n" +
        "OPTIONAL { ?uri rdfs:label ?enName filter (lang(?enName) = 'en'). }\n" +
    "OPTIONAL { ?uri schema:description ?enDesc filter (lang(?enDesc) = 'en'). }\n" +  "\n\}";
    return query;
}

// Perform SPARQL request for each entity
function sparqlRequest(qids) {
    console.log(currentTime() + "Wikidata request");

    // If requesting main subject entity, make special query
    var query = makeQuery(qids);

    var sparqlURL = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);

    //console.log("\n" + query + "\n");        
    //console.log(sparqlURL);

    $.getJSON(sparqlURL, function (data) {
                
        data = data["results"]["bindings"];
        
        var added = [];
        
        for (var i=0; i < data.length; i++) {
            var item = sparqlToItem(data[i]);

            if (added.indexOf(item._id) < 0) {
                    $("#userDBs").append("<a href='toolDemo.html?" + item._id + "' class='data userDB'>" + titlecase(item.enName) + "</a>");
                    $("#narratives-menu").append("<li class='narra-list-item'><a href='toolDemo.html?" + item._id + "' class='data' target = '_blank'>" + titlecase(item.enName) + "</a></li>");
                    added.push(item._id);
            }
        };
        
        if (data.length > 0) {
            $("#userDBs").show();
        }
        
        $("#emptyDiv, #auth-div").hide();
        $("#introDiv").show();
    });
}

// Convert result of SPARQL query to JavaScript object
function sparqlToItem(item, force) {
    var qid = item["uri"]["value"].split("entity/")[1];

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
    if ("birth" in item) newItem["birth"] = item["birth"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("death" in item) newItem["death"] = item["death"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("foundation" in item) newItem["foundation"] = item["foundation"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("foundation2" in item) newItem["foundation2"] = item["foundation2"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];
    if ("completion" in item) newItem["completion"] = item["completion"]["value"].replace("+", "").split("T")[0].split("-01-01")[0];

    // Extract type of the entity
    if ("type" in item) {
        newItem["type"].push(item["type"]["value"].split("entity/")[1]);
    }

    return newItem;
}

// Capitalize all words in a string
function titlecase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function deleteNarrative(ids){
	// e.g. arrayOfidsForDeleting[0]=idNarra [1]=subject [2]=userTable [3]=title of narr
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
			url: "PHP/deleteNarration.php", 
			dataType: "JSON",					
			data: {subject: arrayOfidsForDeleting[1], user: arrayOfidsForDeleting[2], id: arrayOfidsForDeleting[0] },
			success: function(resp) {
				
				window.location.href ="demo.html";
			
			},
			error: function(response){
					var a= JSON.stringify(response)
					alert(a)

			}
		
		});
		}
    );
	
}
