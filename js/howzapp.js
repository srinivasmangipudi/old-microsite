/*!
* Filename: howzapp.js
* Created By: Gajanan Bhat
*/

/*************   GLOBAL CONSTANTS  ***********************/

var HZ_HOST = 'http://howzapp.herokuapp.com';
//var HZ_HOST = 'http://192.168.0.6:5000';

var hz_content = "";

var total_pages = 0;

var min_percent = 0;

var proj_id = "";
var lead_id = "";
var user_id = "";
var lead_name = "";

var params = {};

var pages_visited = "";

var survey_data = "";

var survey_results = {};

var total_sets, survey_id = 0;

var web_lead = 1; // Not from SMS

function getUrlParameters()
{

    //window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(str,key,value){params[key] = value;});
    //console.log(params);

         // OR

    var a = window.location.search.substr(1).split('&');

    //if (a == "") return {};

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
        web_lead = 0;
        getLeadInfo();
    }
    else
    {
        generateWebLead();
    }    
}

/*******************************
 * getPage
 *******************************/
function getPage(page_num)
{
    var title_str = "pg" + page_num + "_title";
    var content_str = "pg" + page_num + "_content";
    
    $('#pg_title').text(hz_content[title_str]);
    $('#pg_content').html(parseToBullet(hz_content[content_str]));

    //var progress_bar_width = (min_percent * page_num).toString() + "%";
    //$("#hz-progress").css("width", progress_bar_width);
    //$("#hz-progress").text(progress_bar_width);

    pages_visited += "," + page_num.toString();

    var metrics_obj = new Object();
    metrics_obj["pagesVisited"] = pages_visited;
    //updateMetrics(metrics_obj);

    $("#hz-next").off('click').on('click', function(){
        if (page_num < total_pages)
        {
            getPage(page_num + 1);
        }
        if (page_num == total_pages)
        {
            if (sessionStorage.getItem('show_photos') == null)
            {
                showPhotoPopup();
            }
            else
            {
                $.get("photos.html", function (data) {
                    //$('#ad_div').hide();
                    $("#property_content").empty();
                    $("#property_content").append(data);
                });
                pages_visited += ",p";

                var metrics_obj = new Object();
                metrics_obj["pagesVisited"] = pages_visited;
                //updateMetrics(metrics_obj);
            }
        }        
    })

    $("#hz-prev").off('click').on('click', function(){
        if (page_num > 1)
        {
            getPage(page_num - 1);
        }
    })

    if (page_num == 1)
    {
        $('#hz-prev').prop('disabled', true);
    }
    else
    {
        $('#hz-prev').prop('disabled', false);   
    }
}

/*******************************
 * parseToBullet
 *******************************/
function parseToBullet(content)
{
    var cont_arr = content.split(".");
    var ul_str = "";

    if (cont_arr.length > 0)
    {
        ul_str = "<ul style=\"width: 100%; margin: auto; font-size: 16px;\">";
        var cont_str = "";
        for (var i = 0; i < cont_arr.length; i++)
        {
            cont_str = $.trim(cont_arr[i]);
            if (cont_str != "")
            {
                ul_str += "<li>" + cont_str + "</li><br>";   
            }
        }
        ul_str += "</ul>";
    }
    
    return ul_str;
}

/*******************************
 * Get survey set data
 *******************************/
function getSurveySet(set_num)
{
    var set_val = "set_" + set_num;

    var sets = survey_data[Object.keys(survey_data)[0]];
    
    for (var key in sets)
    {
        if (sets.hasOwnProperty(key) && key == set_val)
        {
            return sets[key];
        }
    }
}

/*******************************
 * Show survey popup
 *******************************/
function showSurveyPopup(set_num)
{
    //lead_name = document.getElementById('lead_name').value;
    //if (lead_name == "")
    //    lead_name = "Guest";

    //console.log('lname:' + lead_name);

    console.log("set_num="+set_num);
    var set_data = getSurveySet(set_num);
    var set_val = "set_" + set_num;

    var question = set_data.question;

    if (set_num == 1)
    {
        question = question.replace("<placeholder>", lead_name);
    }
    var choices = set_data.choices;

    console.log(set_data);

    var popup_div = document.createElement('div');
    popup_div.setAttribute('data-role', 'header');
    popup_div.setAttribute('role', 'banner');
    popup_div.className = 'ui-header ui-bar-inherit';
    var element = document.createElement('h4');
    element.className = 'ui-content';
    element.setAttribute('role', 'main');
    element.appendChild(document.createTextNode(question));
    popup_div.appendChild(element);
    //popup_div.innerHTML = '<h1 class="ui-title" style="font-size: 16px;" role="heading" aria-level="1">' + question + '</h1></div>';
    //var '<div class="checkbox"><label><input type="checkbox" name="pr_range" value="40-60">40 Lakhs - 60 Lakhs</label></div><br><div class="checkbox"><label><input type="checkbox" name="pr_range" value="60-80">60 Lakhs - 80 Lakhs</label></div><br><div class="checkbox"><label><input type="checkbox" name="pr_range" value="80-100">80 Lakhs - 1 Crore</label></div><a id="pr_ok" href="#" data-role="button" data-rel="back" class="ui-btn ui-shadow ui-corner-all ui-btn-b">OK</a></div>';

    var popup_html = popup_div.outerHTML;
    var radio_html = '';

    for (var row_count = 1; row_count < choices.length; row_count++)
    {
        var radioboxDiv = document.createElement('div');
        radioboxDiv.className = 'checkbox form-inline';
        radioboxDiv.setAttribute("style", 'display:flex; border-bottom: 1px #d6d6d6 solid;');

        var mlRadiobtn = document.createElement("input");
        mlRadiobtn.setAttribute("type", "radio");
        mlRadiobtn.setAttribute("name", set_val);
        mlRadiobtn.setAttribute("id", "rbtn_" + row_count);
        mlRadiobtn.setAttribute("value", row_count);
        radioboxDiv.appendChild(mlRadiobtn);

        mlRadiobtn.onclick = function() {
            document.getElementById('pr_ok').disabled = false;
        }

        var labelElement =  document.createElement('label');
        labelElement.setAttribute("for", "rbtn_" + row_count);
        labelElement.innerHTML = choices[row_count];
        radioboxDiv.appendChild(labelElement);

        radio_html += radioboxDiv.outerHTML;
    }

    var ok_btn = document.createElement('a');
    ok_btn.id="pr_ok" 
    //mlRadiobtn.setAttribute("type", "button");
    ok_btn.setAttribute('data-role', 'button');
    ok_btn.setAttribute('data-rel', 'back');
    //ok_btn.disabled = true;
    ok_btn.className = "ui-btn ui-shadow ui-corner-all ui-btn-b";
    ok_btn.appendChild(document.createTextNode("OK"));


    $('#hz_popup').empty();

    $('#hz_popup').append(popup_html + radio_html + ok_btn.outerHTML);

    $("#pr_ok").off('click').on('click', function(e) {
        //updatePriceRange();
        console.log(set_num + ':' + total_sets);
        var selected_option = $('input[name='+set_val+']:checked').val();
        console.log('so:' + selected_option);
        selected_option = (typeof selected_option == 'undefined') ? '0' : selected_option;
        survey_results[set_val] = selected_option;
        if (set_num < total_sets)
        {
            e.stopPropagation();
            showSurveyPopup(set_num + 1);
        }
        else
        {
            updateSurveyResults();
            //document.getElementById("ad_img").src="css/images/springfields_photo.jpg";
            $("#ad_img").attr("src","css/images/springfields_photo.jpg");
            $("#ad_img").attr("style", "width:100%; height:325px; max-width:200px;");
            $('#nav_div').show();
            $('#hz-prev').prop('disabled', true);
            $("#hz-next").off('click').on('click', function(){
                $('#ad_div').empty();
                $('#property_content').show();
                showProjectInfo();
            })
        }
        if (set_num == 1)
        {
            getProjectInfo();
            //preloadFont();
        }
    });

    $('#hz_popup').popup('open');

    //sessionStorage.setItem('pr_popup', '1');
}

/*******************************
 * updatePriceRange
 *******************************/
function updatePriceRange()
{
    var pr_ranges = $('input[name=pr_range]:checked');
    var price_range = "";

    for (var i = 0; i < pr_ranges.length; i++)
    {
        price_range += pr_ranges[i].value + ",";
    }

    if (price_range != "")
    {
        price_range = price_range.substring(0, price_range.length - 1);
        var metrics_obj = new Object();
        metrics_obj["priceRange"] = price_range;
        updateMetrics(metrics_obj);
    }
}

/*******************************
 * showPhotoPopup
 *******************************/
function showPhotoPopup()
{
    var photo_popup = '<div data-role="header" role="banner" class="ui-header ui-bar-inherit"><h1 class="ui-title" style="font-size: 25px;" role="heading" aria-level="1">Photos</h1></div><div data-role="main" class="ui-content"><h3 class="text-primary text-center">Would you like to see photos of the property?</h3><div class="text-center" style="margin-top: 10px; margin-bottom: 10px;"><a id="hz-yes" style="background: white; color: #337ab7;" data-rel="back" class="ui-btn ui-shadow ui-corner-all">Yes !</a><a id="hz-no" data-rel="back" class="ui-btn ui-shadow ui-corner-all ui-btn-b">No, Thanks !</a></div></div>';

    $('#hz_popup').empty();
    
    $('#hz_popup').append(photo_popup);

    $('#hz_popup').popup('open');

}


/************************
 * Get Project Information
 ************************/
function getProjectInfo()
{
    //var dataString = {auth_token: sessionStorage.auth_token};

    var dataString = {project_id: proj_id, lead_id: lead_id};
    var hz_url =  HZ_HOST + '/get_project';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {
            if (data)
            {
                hz_content = data;
                console.log(hz_content);
            }
        }
    });

    if (web_lead == 0)
    {
        getMetrics();
    }
}

/************************
 * Show Project Information
 ************************/
function showProjectInfo()
{
    total_pages = hz_content.total_pages;
    min_percent = 100/total_pages;

    pages_visited = (pages_visited == "") ? "1" : (pages_visited + ",1");

    var metrics_obj = new Object();
    metrics_obj["pagesVisited"] = pages_visited;
    //updateMetrics(metrics_obj);

    //sessionStorage.setItem("hz_content", JSON.stringify(hz_content));
    //hz_loading').hide();
    $('#pg_title').text(hz_content.pg1_title);
    $('#pg_content').html(parseToBullet(hz_content.pg1_content));

    $('#hz-prev').prop('disabled', true);
    $('#hz-next').prop('disabled', false);
    
    //$("#hz-progress").css("width", "20%");
    //$("#hz-progress").text("20%");
    
    $("#hz-next").off('click').on('click', function(){
        getPage(2);
   })
}

/************************
 * Get Metrics Information
 ************************/
function getMetrics()
{
  //var dataString = {auth_token: sessionStorage.auth_token};
  var dataString = {project_id: proj_id, lead_id: lead_id};
  var hz_url =  HZ_HOST + '/get_metrics';

  $.ajax(
  {
    type: "POST",
    url: hz_url,
    data: dataString,
    dataType: "json",
    async: true,
    success: function (data)
    {
        var visit_cnt = 0;

        if (data)
        {
            pages_visited = (data.pagesVisited == "") ? "1" : (data.pagesVisited + ",1");
            visit_cnt = (data.visitCount == "") ? 0 : parseInt(data.visitCount);
            visit_cnt += 1;
        }
        else
        {
            pages_visited = "1";
            visit_cnt = 1;
        }

        var metrics_obj = new Object();

        metrics_obj["visitedMicrosite"] = "true";
        //metrics_obj["pagesVisited"] = pages_visited;
        metrics_obj["visitCount"] = visit_cnt.toString();

        updateMetrics(metrics_obj);        
    }
  });
}

/************************
 * Update metrics
 ************************/
function updateMetrics(metrics_obj)
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var dataString = {project_id: proj_id, lead_id: lead_id, web_lead: web_lead};
    var hz_url =  HZ_HOST + '/update_metrics';

    dataString['metrics'] = JSON.stringify(metrics_obj);

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

/************************
 * Update visitor count
 ************************/
function updateVisitorCount()
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var dataString = {project_id: proj_id, lead_name: lead_name};
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
 * getSurveyData
 *******************************/
function getSurveyData()
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var dataString = {project_id: proj_id};
    var hz_url =  HZ_HOST + '/get_survey_data';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {
            if (data)
            {
                survey_data = data;
                console.log(survey_data);
                total_sets = survey_data[Object.keys(survey_data)[0]].total_sets;
                survey_id = survey_data[Object.keys(survey_data)[0]].id;                
                console.log('total_sets:' + total_sets); 
                //showSurveyPopup(1);               
            }
        }
    });
}

/*******************************
 * update survey results
 *******************************/
function updateSurveyResults()
{
    //var dataString = {auth_token: sessionStorage.auth_token};

    var dataString = {project_id: proj_id, lead_id: lead_id, lead_name: lead_name, survey_id: survey_id};
    var hz_url =  HZ_HOST + '/update_survey_data';

    console.log("survey_results:" + survey_results);

    dataString['results'] = JSON.stringify(survey_results);
    
    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {
            if (data)
            {
                //console.log(data);
                //lead_id = data.lead_id;
            }
        }
    });
}

/*******************************
 * Generate web lead
 *******************************/
function generateWebLead()
{
    //var dataString = {auth_token: sessionStorage.auth_token};

    var dataString = {project_id: proj_id};
    var hz_url =  HZ_HOST + '/generate_web_lead';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: true,
        success: function (data)
        {
            if (data)
            {
                console.log(data);
                lead_id = data.web_lead_id;
            }
        }
    });
}

/*******************************
 * save lead details
 *******************************/
function saveLeadDetails()
{
    //var dataString = {auth_token: sessionStorage.auth_token};

    var lead_email = document.getElementById('lead_email').value;
    var lead_phone = document.getElementById('lead_phone').value;
    var price_sheet_requested = "Yes";

    if (sessionStorage.getItem('price_sheet_requested') == null)
    {
        price_sheet_requested = "No";
    }

    //var dataString = {project_id: proj_id, price_sheet_requested: price_sheet_requested, lead_id: lead_id, lead_name: lead_name, lead_email: lead_email, lead_phone: lead_phone};
    var dataString = {project_id: proj_id, lead_id: lead_id, lead_name: lead_name, lead_email: lead_email, lead_phone: lead_phone};
    var hz_url =  HZ_HOST + '/save_lead_details';

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

/*******************************
 * Get Lead information 
 * This will be a sync call
 *******************************/
function getLeadInfo()
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var dataString = {project_id: proj_id, lead_id: lead_id};
    var hz_url =  HZ_HOST + '/get_lead_info';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: false,
        success: function (data)
        {
            if (data)
            {
                lead_name = data.lead_name;
                if (lead_name != "")
                {
                    document.getElementById('lead_name').value = lead_name;
                    $('#enter_the_dragon').attr('style',"max-width:100px;background-color:#87ceeb;");
                    $('#enter_the_dragon').removeAttr('disabled');
                }
                //showSurveyPopup(1);               
            }
        }
    });
}


/*******************************
 * showPhotoPopup
 *******************************/
function showWelcomePopup()
{
    var welcome1_popup = '<div data-role="header" role="banner" class="ui-header ui-bar-inherit" id="enter_name" style="margin-top: 5px; margin-bottom: 5px;text-align:center"><div class="form-element form-inline" style="display: inline-flex"><input type="text" class="form-control" id="lead_name" placeholder="Enter Your Name" style="text-align:center;min-width: 150px"><br><button type="button" id="enter_the_dragon" class="btn btn-default" style="max-width:100px;background-color:#dcdcdc;">GO!</button></div></div>';

    var welcome_popup = '<div data-role="header" role="banner" class="ui-header ui-bar-inherit"><h3 class="ui-title" style="font-size: 20px;" role="heading" aria-level="1">Welcome !</h3></div><div data-role="main" class="ui-content"><input type="text" autofocus class="form-control" id="lead_name" placeholder="Enter Your Name" style="text-align:center;min-width: 150px"><div class="text-center" style="margin-top: 10px; margin-bottom: 10px;"><button type="button" id="enter_the_dragon" class="btn btn-default" style="max-width:100px;background-color:#dcdcdc;">GO!</button></div></div>';

    $('#hz_popup').show();

    $('#hz_popup').empty();

    $('#hz_popup').append(welcome_popup);

    $('#hz_popup').popup('open');

    document.getElementById("lead_name").focus();

    $('#enter_the_dragon').attr('disabled','disabled');

    $('#lead_name').keyup(function() {
        if($(this).val() != '')
        {
           $('#enter_the_dragon').removeAttr('disabled');
           $('#enter_the_dragon').attr('style',"max-width:100px;background-color:#87ceeb;");
        }
        else 
        {
            $('#enter_the_dragon').attr('disabled','disabled');
        }
    });    

    $("#enter_the_dragon").off('click').on('click', function(){
       lead_name = document.getElementById('lead_name').value;
        if (lead_name == "")
            lead_name = "Guest";
       showSurveyPopup(1);               
    });
}

/**************
* TESTING
**************/
function preloadFont()
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var fontFile = 'fonts/glyphicons-halflings-regular.woff2';

    $.ajax(
    {
        url: fontFile,
        beforeSend: function(xhr) {
          xhr.overrideMimeType("application/font-woff");
        },
        success: function (data)
        {
        }
    });
}
