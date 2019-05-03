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
        //console.log(fields);
        for (var key in fields) {
            // check if the property/key is defined in the object itself, not in parent
            if (fields.hasOwnProperty(key)) { 
                var col = {"id": "", "dataType": ""};
                col["id"] = key;
                col["dataType"] = fields[key];
                schema_cols.push(col);
            }
        }
        var nested_fields = InfusionSoftModel[tab].nested_fields;
        //console.log(nested_fields);
        for (var f2 in nested_fields.ITEMS) {
            //console.log(f2);
            for (var key in nested_fields.ITEMS[f2]) {
                console.log(key);
                // check if the property/key is defined in the object itself, not in parent
                //if (f2.hasOwnProperty(key)) 
                //{ 
                    var col = {"id": "", "dataType": ""};
                    col["id"] = f2 + "_" + key;
                    col["dataType"] = nested_fields.ITEMS[f2][key];
                    schema_cols.push(col);
                //}
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
        dataToReturn = getJSONResults(table.tableInfo.id);
        table.appendRows(dataToReturn);
        doneCallback();

    };

    function getJSONResults(table) {
        var dataToReturn = [];
        //var accessToken = Cookies.get("accessToken");
        var accessToken = tableau.password;
        var uri = InfusionSoftModel[table].uri + accessToken;
        //console.log(uri);
        var hasMoreData = true;
        var offset = 0;


        while(hasMoreData && offset < 5000) {
            var offset_uri = uri + "&limit=1000&offset=" + offset;
            offset = offset + 1000;

            var value= $.ajax({ 
                    url: offset_uri, 
                    async: false
                }).responseJSON;
            
            var retArray = value[table];
            
            if (retArray.length < 1000)
                hasMoreData = false;
            
            //dataToReturn = getDataFromResponse(retArray, campaign_fields);
            dataToReturn = dataToReturn.concat(getDataFromResponse(retArray, InfusionSoftModel[table]));
        }
        /*
        $.getJSON(uri, function(data) {
                    var retArray = data[table];
                    //dataToReturn = getDataFromResponse(retArray, InfusionSoftModel[table].base_fields);
                    dataToReturn = getDataFromResponse(retArray, campaign_fields);
        });*/
        console.log("dataToReturn length 2: " + dataToReturn.length);
        return dataToReturn;
    }




    function getDataFromResponse(retArray, collTemplate) {
		var dataToReturn = [];
		var ii;
		//console.log("return length: " + retArray.length);
		
		var base_fields = collTemplate.base_fields;
		var nested_fields = collTemplate.nested_fields;
		
		for (ii = 0; ii < retArray.length; ++ii) {
			var dataPair = {};
			for (var key in base_fields) {
				// check if the property/key is defined in the object itself, not in parent
				if (base_fields.hasOwnProperty(key)) { 
					
					if (base_fields[key] == "datetime") {
						try {
                            //var date = new Date(retArray[ii][key]);
                            //var date2= new Date(date.getYear(), date.getMonth, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);
                            var dateFormat = "YYYY-MM-DD HH:mm:ss";
 
							var date = moment(retArray[ii][key]).format(dateFormat);

							dataPair[key] = date;
                            //dataPair[key] = date2.toISOString();
                            //date.YYYYMMDDHHMMSS();
                            //dataPair[key] = date;
						}
						catch(err) {
							//console.log("error:" + err);
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
			dataToReturn.push(dataPair);
		}
		return dataToReturn;
	}
    Date.prototype.YYYYMMDDHHMMSS = function () {
        var yyyy = this.getFullYear().toString();
        var MM = this.getMonth().toString().paddingLeft("00");
        var dd = this.getDate().toString().paddingLeft("00");
        var hh = this.getHours().toString().paddingLeft("00");
        var mm = this.getMinutes().toString().paddingLeft("00");
        var ss = this.getSeconds().toString().paddingLeft("00");
		
		//var MM = pad(this.getMonth() + 1,2);
        //var dd = pad(this.getDate(), 2);
        //var hh = pad(this.getHours(), 2);
        //var mm = pad(this.getMinutes(), 2)
        //var ss = pad(this.getSeconds(), 2)

        return yyyy + '/' + MM + '/' + dd + ' ' + hh  + ':' + mm + ':' + ss;
    };
	String.prototype.paddingLeft = function (paddingValue) {
		return String(paddingValue + this).slice(-paddingValue.length);
	};
    // Register the tableau connector, call this last
    tableau.registerConnector(myConnector);
})();
