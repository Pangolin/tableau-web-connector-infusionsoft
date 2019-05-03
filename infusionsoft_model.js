var campaigns = {
	"id": "int",
	"name": "string",
	"active_contact_count": "int",
	"completed_contact_count":"int",
	"created_by_global_id": "int",
	"date_created": "datetime",
	"error_message": "string",
	"locked": "bool",
	"published_date": "datetime",
	"published_status": "bool",
	"published_time_zone": "string",
	"time_zone": "string"
	//goals-nested
	//sequences-nested
}	

var contacts = {
	"id" : "int",
	"given_name" : "string",
	"middle_name" : "string",
	"family_name" : "string",
	"owner_id" : "int",
	"email_opted_in" : "bool",
	"date_created" : "datetime",
	"last_updated" : "datetime",
	"email_status" : "string",
	//"addresses": nested array [ nested array
	"anniversary": "datetime",
	"birthday": "datetime",
	/*"company": {
	"company_name": "string",
	"id": 0
	},*/
	"contact_type": "string",
	//"custom_fields": [ nested array
	//"email_addresses": [ nested array
	//"fax_numbers": [ nested array
	"job_title": "string",
	"lead_source_id": "int",
	//"phone_numbers": [ nested array
	"preferred_locale": "string",
	"preferred_name": "string",
	"prefix": "string",
	//"social_accounts": [nested array
	"source_type": "string",
	"spouse_name": "string",
	"suffix": "string",
	"time_zone": "string",
	"website": "string"
}
var contacts_nestedJSON = {
	"NESTED_IN": "contacts",
	"ITEMS": {
		"company": {
			"company_name": "string",
			"id": "int"
		},
	}
}


/*Email,Note,Opportunity,Product,Tags*/
var emails = {
  "clicked_date": "datetime",
  "contact_id": "int",
  "headers": "string",
  "id": "int",
  "opened_date": "datetime",
  "original_provider": "string",
  "original_provider_id": "string",
  "received_date": "datetime",
  "sent_date": "datetime",
  "sent_from_address": "string",
  "sent_from_reply_address": "string",
  "sent_to_address": "string",
  "sent_to_bcc_addresses": "string",
  "sent_to_cc_addresses": "string",
  "subject": "string"
}
var notes = {
  "body": "string",
  "contact_id": "int",
  "date_created": "datetime",
  "id": "int",
  "last_updated": "datetime",
  "title": "string",
  "type": "string",
  "user_id": "int"
}
var notes_nestedJSON = {
	"NESTED_IN": "notes",
	"ITEMS": {
		"last_updated_by": {
			"family_name": "string",
			"given_name": "string",
			"user_id": "int"
		},
	}
}

var opportunities = {
  "affiliate_id": "int",
  /*
  "custom_fields": [
	{
	  "content": {},
	  "id": 0
	}
  ],*/
  "date_created": "datetime",
  "estimated_close_date": "datetime",
  "id": "int",
  "include_in_forecast": "int",
  "last_updated": "datetime",
  "next_action_date": "datetime",
  "next_action_notes": "string",
  "opportunity_notes": "string",
  "opportunity_title": "string",
  "projected_revenue_high": "int",
  "projected_revenue_low": "int"
  /*"stage": {
	"details": {
	  "check_list_items": [
		{
		  "description": "string",
		  "done_date": "2019-05-03T04:19:04.401Z",
		  "id": 0,
		  "instance_id": 0,
		  "item_order": 0,
		  "required": true
		}
	  ],
	  "probability": 0,
	  "stage_order": 0,
	  "target_num_days": 0
	},
	"id": 0,
	"name": "string",
	"reasons": [
	  "string"
	]
  },
  "user": {
	"first_name": "string",
	"id": 0,
	"last_name": "string"
  }*/
}
var opportunities_nestedJSON = {
	"NESTED_IN": "opportunities",
	"ITEMS": {
		"contact": {
			"company_name": "string",
			"email": "string",
			"first_name": "string",
			"id": "int",
			"job_title": "string",
			"last_name": "string",
			"phone_number": "string"
		},
		"stage": {
			/*"details": {
			  "check_list_items": [
				{
				  "description": "string",
				  "done_date": "2019-05-03T04:19:04.401Z",
				  "id": 0,
				  "instance_id": 0,
				  "item_order": 0,
				  "required": true
				}
			  ],
			  "probability": 0,
			  "stage_order": 0,
			  "target_num_days": 0
			},*/
			"id": "int",
			"name": "string",
			/*"reasons": [
			  "string"
			]*/
		},
		"user": {
			"first_name": "string",
			"id": "int",
			"last_name": "string"
		},
	}
}

var products = {
      "id": "int",
      "product_desc": "string",
      "product_name": "string",
      /*"product_options": [
        {
          "allow_spaces": true,
          "can_contain_character": true,
          "can_contain_number": true,
          "can_end_with_character": true,
          "can_end_with_number": true,
          "can_start_with_character": true,
          "can_start_with_number": true,
          "display_index": 0,
          "id": 0,
          "label": "string",
          "max_chars": 0,
          "min_chars": 0,
          "name": "string",
          "required": true,
          "text_message": "string",
          "type": "FixedList",
          "values": [
            {
              "id": 0,
              "index": 0,
              "is_default": true,
              "label": "string",
              "price_adjustment": 0,
              "sku": "string"
            }
          ]
        }
      ],*/
      "product_price": "int",
      "product_short_desc": "string",
      "sku": "string",
      "status": "int",
      "sub_category_id": "int",
      "subscription_only": "bool",
	  /*
      "subscription_plans": [
        {
          "active": true,
          "cycle": 0,
          "frequency": 0,
          "id": 0,
          "number_of_cycles": 0,
          "plan_price": 0,
          "subscription_plan_index": 0,
          "subscription_plan_name": "string",
          "url": "string"
        }
		
      ],*/
      "url": "string"
}
var tags = {
	/**/
	"description": "string",
	"id": "int",
	"name": "string"
}
var tags_nestedJSON = {
	"NESTED_IN": "tags",
	"ITEMS": {
		"category": {
			"description": "string",
			"id": "int",
			"name": "string"
		},
	}
}

var InfusionSoftModel = 
	{ 	
		"campaigns" : 
		{
			"end_point": "campaigns",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/campaigns?access_token=",
			"base_fields": campaigns,
			"nested_fields": "{ \"ITEMS\": {}}"
		},
		"contacts" :
		{
			"end_point": "contacts",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/contacts?access_token=",
			"base_fields": contacts,
			"nested_fields" : contacts_nestedJSON
		},
		"emails" :
		{
			"end_point": "emails",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/emails?access_token=",
			"base_fields": emails,
			"nested_fields": "{ \"ITEMS\": {}}"
		},
		"notes" :
		{
			"end_point": "notes",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/notes?access_token=",
			"base_fields": notes,
			"nested_fields": notes_nestedJSON
		},
		"opportunities" :
		{
			"end_point": "opportunities",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/opportunities?access_token=",
			"base_fields": opportunities,
			"nested_fields": opportunities_nestedJSON
		},
		"products" :
		{
			"end_point": "products",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/products?access_token=",
			"base_fields": products,
			"nested_fields": "{ \"ITEMS\": {}}"
		},
		"tags" :
		{
			"end_point": "tags",
			"uri": "https://api.infusionsoft.com/crm/rest/v1/tags?access_token=",
			"base_fields": tags,
			"nested_fields": tags_nestedJSON
		},
	}
