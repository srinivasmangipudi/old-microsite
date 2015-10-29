/*!
* Filename: howzapp_short.js
* Created By: Gajanan Bhat
*/

/*************   GLOBAL CONSTANTS  ***********************/

var HZ_HOST = 'http://howzapp.herokuapp.com';
//var HZ_HOST = 'http://192.168.0.6:5000';

var proj_id = "";
var lead_id = "";
var user_id = "";

var params = {};


/************************
 * Get URL Parameters
 ************************/
function getUrlParameters()
{
    var a = window.location.search.substr(1).split('&');

    for (var i = 0; i < a.length; ++i)
    {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            params[p[0]] = "";
        else
            params[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }

    console.log(params);

    if (/[?&]hzUserId=/.test(location.href))
    {
        user_id = params['hzUserId'];
    }

    if (/[?&]hzProjectId=/.test(location.href))
    {
        proj_id = params['hzProjectId'];
    }
    else
    {
        //proj_id = "-K0QYrImX4HrL5ubYkDC";
        proj_id = "-K0h7MU7M5U9K6ZKgi3I";
    }

    if (/[?&]hzLeadId=/.test(location.href))
    {
        lead_id = params['hzLeadId'];
    }
}

/************************
 * Update visitor count
 ************************/
function updateVisitorCount()
{
    var dataString = {project_id: proj_id};
    var hz_url =  HZ_HOST + '/update_visitor_count';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {
            //console.log(data);
        }
    });
}

/*******************************
 * save lead details
 *******************************/
function addLeadDetails()
{
    //var dataString = {auth_token: sessionStorage.auth_token};

    var lead_email = document.getElementById('lead_email').value;
    var lead_name = document.getElementById('lead_name').value;
    var lead_phone = document.getElementById('lead_phone').value;

    var dataString = {project_id: proj_id, lead_name: lead_name, lead_email: lead_email, lead_phone: lead_phone};
    var hz_url =  HZ_HOST + '/add_lead_details';

    console.log(dataString);

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {

        }
    });
}


