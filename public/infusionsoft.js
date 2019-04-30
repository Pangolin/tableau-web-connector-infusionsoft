import { strict } from "assert";

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
    //Campaign
    //Contact
    //Email
    //Note
    //Opportunity
    //Product
    //Tags
    var campaign_col1 = { id: "id", dataType: "int"};
    var campaign_col2 = { id: "name", dataType: "string"};
    var campaign_col3 = { id: "active_contact_count", dataType: "int"};
    var campaign_col4 = { id: "completed_contact_count", dataType: "int"};
    var campaign_cols = [campaign_col1, campaign_col2, campaign_col3, campaign_col4];

    var contacts_col1 = { id: "id", dataType: "int"};
    var contacts_col2 = { id: "given_name", dataType: "string"};
    var contacts_col3 = { id: "middle_name", dataType: "string"};
    var contacts_col4 = { id: "family_name", dataType: "string"};
    var contacts_col5= { id: "owner_id", dataType: "int"};
    var contacts_col6 = { id: "email_opted_in", dataType: "bool"};
    var contacts_col7 = { id: "date_created", dataType: "datetime"};
    var contacts_col8 = { id: "last_updated", dataType: "datetime"};
    var contacts_col9 = { id: "email_status", dataType: "string"};
    var contacts_col10 = { id: "company_id", dataType: "int"};
    var contacts_col11 = { id: "company_name", dataType: "string"};
    //addresses[]
    //tag_ids[]
    //email_status", dataType: " str
    //phone_numbers[]
    //"number": "(305) 710-6357",
    //      "extension": null,
    //      "field": "PHONE1",
    //      "type": null
    //},
    
    var contacts_cols = [contacts_col1, contacts_col2, contacts_col3, contacts_col4, contacts_col5,
        contacts_col6, contacts_col7, contacts_col8, contacts_col9, contacts_col10, contacts_col11];

    var tableInfo_campaign = {
        id: "Campaign",
        columns: campaign_cols
    };
    
    var tableInfo_contacts = {
        id: "Contacts",
        columns: contacts_cols
    };

    schema.push(tableInfo_campaign);
    schema.push(tableInfo_contacts);

    schemaCallback(schema);
  };

  // This function actually make the infusionsoft API call and
  // parses the results and passes them back to Tableau
  myConnector.getData = function(table, doneCallback) {
    var dataToReturn = [];
    var hasMoreData = false;

    var accessToken = tableau.password;
    //var connectionUri = getVenueLikesURI(accessToken);
    var campaignsUri = "https://api.infusionsoft.com/crm/rest/v1/campaigns?access_token="+accessToken;
    var contactsUri = "https://api.infusionsoft.com/crm/rest/v1/contacts?access_token="+accessToken;
    tableau.log("in get Data");

    if (table.tableInfo.id == "Campaign") {

        $.getJSON(campaignsUri, function(data) {
            //if (data.response) {
                var campaigns = data.campaigns;

                var ii;
                for (ii = 0; ii < campaigns.length; ++ii) {
                    var campaign = {'id': campaigns[ii].id,
                                'name': campaigns[ii].name,
                                'active_contact_count': campaigns[ii].active_contact_count,
                                'completed_contact_count' : campaigns[ii].completed_contact_count};
                    dataToReturn.push(campaign);
                }

                table.appendRows(dataToReturn);
                doneCallback();
            //}
            //else {
            //    tableau.abortWithError("No results found - campaign");
            //}
        });
 
    }
    else if (table.tableInfo.id == "Contacts") {
        hasMoreData = true;
        var offset = 0;
        while(hasMoreData) {
            contactsUri = contactsUri + "limit=1000&order=id&offset=" + toString(offset);

            $.getJSON(contactsUri, function(data) {
                //if (data.response) {
                //limit=5&offset=5&order=id
                offset = offset + 1000;
                if (contacts.length < 1000) {
                    hasMoreData = false;
                }
                var contacts = data.contacts;
                var ii;
                for (ii = 0; ii < contacts.length; ++ii) {
                    var contact = {'id': contacts[ii].id,
                                    'given_name': contacts[ii].given_name,
                                    'middle_name': contacts[ii].middle_name,
                                    'family_name' : contacts[ii].family_name,
                                    'owner_id' : contacts[ii].owner_id,
                                    "email_opted_in": contacts[ii].email_opted_in,
                                    "date_created": contacts[ii].date_created,
                                    "last_updated": contacts[ii].last_updated,
                                    "email_status": contacts[ii].email_status,
                                    "company_id": contacts[ii].company.id,
                                    "company_name": contacts[ii].company.company_name
                                };
                    dataToReturn.push(contact);
                }
                table.appendRows(dataToReturn);
            });
        }
        doneCallback();
    }
  };

  // Register the tableau connector, call this last
  tableau.registerConnector(myConnector);
})();
