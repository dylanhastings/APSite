$(document).on("submit", "form", function(e){ 
    var user=$("#username").val(); 
    user = user.toLowerCase(); 
    $("#username").val(user); 
    console.log(user); 
}); 