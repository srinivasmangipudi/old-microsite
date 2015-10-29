/*!
* Filename: howzapp.js
* Created By: Gajanan Bhat
*/

/*************   GLOBAL CONSTANTS  ***********************/

//var HZ_HOST = 'http://howzapp.herokuapp.com';
var HZ_HOST = 'http://192.168.0.104:5000';

var user_list = {};

/************************
 * Get List of Users
 ************************/
function getUserList()
{
    //var dataString = {auth_token: sessionStorage.auth_token};
    
   var hz_url =  HZ_HOST + '/get_user_list';

    $.ajax(
    {
        type: "POST",
        url: hz_url,
        data: "",
        dataType: "json",
        async: false,
        success: function (data)
        {
            if (data)
            {
                user_list = data;
                console.log(user_list);
                var userSelect = document.getElementById('select_user');
                var i = 0;
                for (var key in user_list) 
                {
				   if (user_list.hasOwnProperty(key)) 
				   {
				   		var user = user_list[key];
				      	console.log(key, user);
				      	userSelect.options[userSelect.options.length] = new Option(user.name, user.regId);
				      	if (i == 0)
				      	{
				      		document.getElementById('user_name').value = user.name;
				      		document.getElementById('user_mobile').value = user.phoneNumber;
				      	}
				 		i++;
				   }
				}
				//userSelect.options[userSelect.options.length] = new Option("test1", "val1");
				//userSelect.options[userSelect.options.length] = new Option("test2", "val2");
            }
        }
    });


	$("#gcm_btn").on('click', function(){
        sendGcmMessage();
    })

    document.getElementById('select_user').onchange = function() {
		var index = this.selectedIndex;
		var name = this.children[index].innerHTML.trim();
		var phoneNumber = user_list[name].phoneNumber;
	  	document.getElementById('user_name').value = name;
		document.getElementById('user_mobile').value = phoneNumber;
	}
}

function sendGcmMessage()
{
	var regId = document.getElementById('select_user').value;
	var gcm_message = document.getElementById('gcm_message').value;

	var dataString = {reg_id: regId, message: gcm_message};
	
	var hz_url =  HZ_HOST + '/send_gcm_message';

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
            	var user_name = document.getElementById('user_name').value;
				var phoneNumber = document.getElementById('user_mobile').value;
                console.log("gcm message sent to: " + user_name + ", mobile: " + phoneNumber);
            }
        }
    });

}