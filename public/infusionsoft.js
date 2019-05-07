(function() {
  'use strict';

  // This config stores the important strings needed to
  // connect to the infusionsoft API and OAuth service
  //
  // Storing these here is insecure for a public app
  // See part II. of this tutorial for an example of how
  // to do a server-side OAuth flow and avoid this problem
  var config = {
      clientId: 'j7bhw2xr6pn5bsqq7av7qud7',
      //redirectUri: 'http://localhost:3333/redirect',
      redirectUri: 'https://wdc-infusionsoft.herokuapp.com/redirect',
      authUrl: 'https://signin.infusionsoft.com/app/oauth/authorize',
      version: '20190102'
  };

  // Called when web page first loads and when
  // the OAuth flow returns to the page
  //
  // This function parses the access token in the URI if available
  // It also adds a link to the infusionsoft connect button
  $(document).ready(function() {
      var accessToken = Cookies.get("accessToken");
      var hasAuth = accessToken && accessToken.length > 0;
      updateUIWithAuthState(hasAuth);

      $("#connectbutton").click(function() {
          doAuthRedirect();
      });

      $("#getInfusionsoftData").click(function() {
          tableau.connectionName = "Infusionsoft RestAPI";
          tableau.submit();
      });
  });

  // An on-click function for the connect to infusionsoft button,
  // This will redirect the user to a infusionsoft login
  function doAuthRedirect() {
      var appId = config.clientId;
      if (tableau.authPurpose === tableau.authPurposeEnum.ephemerel) {
        appId = config.clientId;
      } else if (tableau.authPurpose === tableau.authPurposeEnum.enduring) {
        appId = config.clientId; // This should be the Tableau Server appID
      }

      var url = config.authUrl + '?response_type=code&client_id=' + appId +
              '&redirect_uri=' + config.redirectUri;
      window.location.href = url;
  }

  //------------- OAuth Helpers -------------//
  // This helper function returns the URI for the  endpoint
  // It appends the passed in accessToken to the call to personalize the call for the user
 

  // This function toggles the label shown depending
  // on whether or not the user has been authenticated
  function updateUIWithAuthState(hasAuth) {
      if (hasAuth) {
          $(".notsignedin").css('display', 'none');
          $(".signedin").css('display', 'block');
      } else {
          $(".notsignedin").css('display', 'block');
          $(".signedin").css('display', 'none');
      }
  }

  //------------- Tableau WDC code -------------//
  // Create tableau connector, should be called first
  var myConnector = tableau.makeConnector();

  // Init function for connector, called during every phase but
  // only called when running inside the simulator or tableau
  myConnector.init = function(initCallback) {
      tableau.authType = tableau.authTypeEnum.custom;

      // If we are in the auth phase we only want to show the UI needed for auth
      if (tableau.phase == tableau.phaseEnum.authPhase) {
        $("#getvenuesbutton").css('display', 'none');
      }

      if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {
        // If API that WDC is using has an endpoint that checks
        // the validity of an access token, that could be used here.
        // Then the WDC can call tableau.abortForAuth if that access token
        // is invalid.
      }

      var accessToken = Cookies.get("accessToken");
      console.log("Access token is '" + accessToken + "'");
      var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
      updateUIWithAuthState(hasAuth);

      initCallback();

      // If we are not in the data gathering phase, we want to store the token
      // This allows us to access the token in the data gathering phase
      if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
          if (hasAuth) {
              tableau.password = accessToken;

              if (tableau.phase == tableau.phaseEnum.authPhase) {
                // Auto-submit here if we are in the auth phase
                tableau.submit()
              }

              return;
          }
      }
  };

  // Declare the data to Tableau that we are returning from infusionsoft
  myConnector.getSchema = function(schemaCallback) {
    var schema = [];
    for (var tab in InfusionSoftModel) { 
        var schema_cols = [];
        var fields = InfusionSoftModel[tab].base_fields;
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) { 
                var col = {"id": "", "dataType": ""};
                col["id"] = key;
                col["dataType"] = fields[key];
                schema_cols.push(col);
            }
        }
        var nested_fields = InfusionSoftModel[tab].nested_fields;
        for (var f2 in nested_fields.ITEMS) {
            for (var key in nested_fields.ITEMS[f2]) {
                var col = {"id": "", "dataType": ""};
                col["id"] = f2 + "_" + key;
                col["dataType"] = nested_fields.ITEMS[f2][key];
                schema_cols.push(col);
            }
        }
        var nested_arrays = InfusionSoftModel[tab].nested_arrays;
        if (nested_arrays.PICK == "FIRST") {
            for (var f2 in nested_arrays.ITEMS) {
                for (var key in nested_arrays.ITEMS[f2]) {
                    var col = {"id": "", "dataType": ""};
                    col["id"] = f2 + "_" + key;
                    col["dataType"] = nested_arrays.ITEMS[f2][key];
                    schema_cols.push(col);
                }
            }
        }
        
        var tableInfo = {
            id: tab,
            columns: schema_cols
        };
        schema.push(tableInfo);
    }

     schemaCallback(schema);
  };

  // This function actually make the infusionsoft API call and
  // parses the results and passes them back to Tableau
    myConnector.getData = function(table, doneCallback) {
        var dataToReturn = [];
        if (InfusionSoftModel[table.tableInfo.id].handling == "special") {
            dataToReturn = getJSONResultsSpecial(table.tableInfo.id);
        }
        else {
            dataToReturn = getJSONResults(table.tableInfo.id);
        }
        table.appendRows(dataToReturn);
        doneCallback();

    };

    function getJSONResults(table) {
		var dataToReturn = [];
        //var accessToken = Cookies.get("accessToken");
        var accessToken = tableau.password;
		var uri = InfusionSoftModel[table].uri + accessToken;
		var hasMoreData = true;
		var offset = 0;
        
		
		while(hasMoreData && offset < 20000) {
			var offset_uri = uri + "&limit=1000&offset=" + offset;
			offset = offset + 1000;
		
			var value= $.ajax({ 
				  url: offset_uri, 
				  async: false
			   }).responseJSON;

			var retArray = value[InfusionSoftModel[table].end_point];		
			if (retArray.length < 1000)
				hasMoreData = false;
            
            if ( InfusionSoftModel[table].handling != "special_array" ){ 
                dataToReturn = dataToReturn.concat(getDataFromResponse(retArray, InfusionSoftModel[table], null));
            }
            else {
                dataToReturn = dataToReturn.concat(getDataFromResponseSpecial(retArray, InfusionSoftModel[table], null));
            }
		}

		console.log("dataToReturn length 2: " + dataToReturn.length);
		return dataToReturn;
	}
	function getJSONResultsSpecial(table) {
		var dataToReturn = [];
        //var accessToken = Cookies.get("accessToken");
        var accessToken = tableau.password;
		var uri = InfusionSoftModel[table].First_uri + accessToken;
		
		var value= $.ajax({ 
				  url: uri, 
				  async: false
			   }).responseJSON;
		
		var loopArray = value[InfusionSoftModel[table].First_end_point];
		
		var i;

		for(i = 0; i < loopArray.length; i++) {
			var loop_element_val = loopArray[i][InfusionSoftModel[table].loop_element];
			var hasMoreData = true;
			var offset = 0;
			var uri_2 = InfusionSoftModel[table].Second_uri + accessToken;
			uri_2 = uri_2.replace("<<loop_element>>", loop_element_val);

			while(hasMoreData && offset < 20000) {
				uri_2 = uri_2 + "&limit=1000&offset=" + offset;
				offset = offset + 1000;
			
				var value_2= $.ajax({ 
					  url: uri_2, 
					  async: false
				   }).responseJSON;
				
				var retArray = value_2[InfusionSoftModel[table].Second_end_point];
				
				if (retArray.length < 1000)
					hasMoreData = false;
				
				dataToReturn = dataToReturn.concat(getDataFromResponse(retArray, InfusionSoftModel[table],loop_element_val));
			}
		}

		console.log("dataToReturn length 3: " + dataToReturn.length);
		return dataToReturn;
	}
	
	
	
	function getDataFromResponse(retArray, collTemplate, loop_val) {
		var dataToReturn = [];
		var ii;
		//console.log("return length: " + retArray.length);
		
		//console.log("loop_val : " + loop_val);
		
		var base_fields = collTemplate.base_fields;
		var nested_fields = collTemplate.nested_fields;
		var nested_arrays = collTemplate.nested_arrays;
		
		for (ii = 0; ii < retArray.length; ++ii) {
			var dataPair = {};
			
			for (var key in base_fields) {
				// check if the property/key is defined in the object itself, not in parent
				if (base_fields.hasOwnProperty(key)) { 
					if (base_fields[key] == "datetime") {
						try {
							var dateFormat = "YYYY-MM-DD HH:mm:ss";
							var date = moment(retArray[ii][key]).format(dateFormat);
							dataPair[key] = date;
						}
						catch(err) {
							console.log("error:" + err);
							dataPair[key] = retArray[ii][key];
						}
					}
					else {
						dataPair[key] = retArray[ii][key];
					}
				}
			}
			for (var f2 in nested_fields.ITEMS) {
				for (var key in nested_fields.ITEMS[f2]) {
					//console.log(key);
					try {
						dataPair[f2 + "_" + key] = retArray[ii][f2][key];
					}
					catch(err){
						dataPair[f2 + "_" + key] = null;
					}
				}
			}
			
			if (nested_arrays.PICK == "FIRST") {
				//console.log("here");
				for (var f2 in nested_arrays.ITEMS) {
					//console.log(f2);
					for (var key in nested_arrays.ITEMS[f2]) {
						//console.log(retArray[ii][f2]);
						if (retArray[ii][f2].length > 0 ) {
							try {
								dataPair[f2 + "_" + key] = retArray[ii][f2][0][key];
							}
							catch(err){
								dataPair[f2 + "_" + key] = null;
							}
						}
						else {
							dataPair[f2 + "_" + key] = null;
						}
					}
				}
			}

			if (loop_val!= null && collTemplate.handling == "special") {
				dataPair[collTemplate.loop_element_alias] = loop_val;
			}
			
			dataToReturn.push(dataPair);
		}
		return dataToReturn;
	}

    function getDataFromResponseSpecial(retArray, collTemplate, loop_val) {
		var dataToReturn = [];
		var ii;
		//console.log("return length: " + retArray.length);
		
		//console.log("loop_val : " + loop_val);
		
		var base_fields = collTemplate.base_fields;
		
		for (ii = 0; ii < retArray.length; ++ii) {
            custom_fields = retArray[ii]['custom_fields'];
            for (field in custom_fields) {
                var dataPair = {};
                try {
                    dataPair['contacts_id'] = retArray[ii]['id'];
                    dataPair['custom_fields_id'] = field['id'];
                    dataPair['custom_fields_content'] = field['content'];
                }
                catch(err) {
                    console.log("error:" + err);
                }
                if (!isEmpty(dataPair))
                    dataToReturn.push(dataPair);
            }	
		}
		return dataToReturn;
    }
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
      }
    // Register the tableau connector, call this last
    tableau.registerConnector(myConnector);
})();
