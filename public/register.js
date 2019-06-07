
$(document).on("submit", "form", function(e){
    var user=$("#username").val();
    user = user.toLowerCase();
    $("#username").val(user);
    console.log(user);
    
    if($("#password").val()!= $("#passwordconfirm").val()){
    e.preventDefault();
    alert('Passwords do not match');
    return  false;
    }else{
        return true;
    }
});
