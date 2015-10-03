/*!
* Filename: howzapp.js
* Created By: Gajanan Bhat
*/

/*************   GLOBAL CONSTANTS  ***********************/

//var HZ_HOST = 'http://howzapp.herokuapp.com';
var HZ_HOST = 'http://192.168.0.105:5000';

var hz_content = "";

var total_pages = 0;

var min_percent = 0;

var proj_id, lead_id = "";

var params = {};

var pages_visited = "0";

function getUrlParameters()
{

    //window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(str,key,value){params[key] = value;});
    //console.log(params);

         // OR

    var a = window.location.search.substr(1).split('&');
    
    lead_id = "gajanan";
    proj_id = "p1";

    if (a == "") return {};

    for (var i = 0; i < a.length; ++i)
    {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            params[p[0]] = "";
        else
            params[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }

    console.log(params);

    //lead_id = params['huId'];
    //proj_id = params['prId'];
}

/*******************************
 * getPage
 *******************************/
function getPage(page_num)
{
    if (sessionStorage.getItem('pr_popup') == null && page_num == 3)
    {
         showPricePopup();
    }

    var title_str = "pg" + page_num + "_title";
    var content_str = "pg" + page_num + "_content";
    
    $('#pg_title').text(hz_content[title_str]);
    $('#pg_content').html(parseToBullet(hz_content[content_str]));

    var progress_bar_width = (min_percent * page_num).toString() + "%";
    $("#hz-progress").css("width", progress_bar_width);
    $("#hz-progress").text(progress_bar_width);

    pages_visited += "," + page_num.toString();

    var metrics_obj = new Object();
    metrics_obj["pagesVisited"] = pages_visited;
    updateMetrics(metrics_obj);

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
                    $("#swipetest").empty();
                    $("#swipetest").append(data);
                });
                pages_visited += ",p";

                var metrics_obj = new Object();
                metrics_obj["pagesVisited"] = pages_visited;
                updateMetrics(metrics_obj);
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
        ul_str = "<ul style=\"width: 80%; margin: auto; font-size: 16px;\">";
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
 * showPricePopup
 *******************************/
function showPricePopup()
{
    
    var pr_popup = '<div data-role="header" role="banner" class="ui-header ui-bar-inherit"><h1 class="ui-title" style="font-size: 16px;" role="heading" aria-level="1">Price Range</h1></div><div class="checkbox"><label><input type="checkbox" name="pr_range" value="40-60">40 Lakhs - 60 Lakhs</label></div><br><div class="checkbox"><label><input type="checkbox" name="pr_range" value="60-80">60 Lakhs - 80 Lakhs</label></div><br><div class="checkbox"><label><input type="checkbox" name="pr_range" value="80-100">80 Lakhs - 1 Crore</label></div><a id="pr_ok" href="#" data-role="button" data-rel="back" class="ui-btn ui-shadow ui-corner-all ui-btn-b">OK</a></div>';

    $('#hz_popup').empty();

    $('#hz_popup').append(pr_popup);

    $("#pr_ok").on('click', function() {
        updatePriceRange();
    });

    $('#hz_popup').popup('open');

    sessionStorage.setItem('pr_popup', '1');
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
    
    getUrlParameters();

    var dataString = {project_id: proj_id};
    var hz_url =  HZ_HOST + '/get_project';

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
                hz_content = data;
                console.log(hz_content);
                total_pages = hz_content.total_pages;
                min_percent = 100/total_pages;

                //sessionStorage.setItem("hz_content", JSON.stringify(hz_content));
                $('#hz_loading').hide();
                $('#pg_title').text(hz_content.pg1_title);
                $('#pg_content').html(parseToBullet(hz_content.pg1_content));

                $('#hz-prev').prop('disabled', true);
                $('#hz-next').prop('disabled', false);
                
                $("#hz-progress").css("width", "20%");
                $("#hz-progress").text("20%");
                
                $("#hz-next").off('click').on('click', function(){
                    getPage(2);
               })
            }
        }
    });

    getMetrics();
}

/************************
 * Get Metrics Information
 ************************/
function getMetrics()
{
  //var dataString = {auth_token: sessionStorage.auth_token};
  var dataString = {project_id: proj_id, uid: lead_id};
  var hz_url =  HZ_HOST + '/get_metrics';

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
            var visit_cnt = 0;
            pages_visited = (data.pagesVisited == "") ? "1" : (data.pagesVisited + ",1");
            visit_cnt = parseInt(data.visitCount);
            visit_cnt += 1;

            var metrics_obj = new Object();

            metrics_obj["visitedMicrosite"] = "1";
            metrics_obj["pagesVisited"] = pages_visited;
            metrics_obj["visitCount"] = visit_cnt.toString();

            updateMetrics(metrics_obj);
        }
    }
  });
}

/************************
 * Update metrics
 ************************/
function updateMetrics(metrics_obj)
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    var dataString = {project_id: proj_id, uid: lead_id};
    var hz_url =  HZ_HOST + '/update_metrics';

    dataString['metrics'] = JSON.stringify(metrics_obj);

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: dataString,
        dataType: "json",
        async: false,
        success: function (data)
        {
            //console.log(data);
        }
    });
}

