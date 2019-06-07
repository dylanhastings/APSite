$(".addJob").on("click",function(){
  addJob();
});
$(document).on("click", ".removeJob",function() {
  $(this).parent().remove()
});                                                      


$(document).on("click",".submitButton",function(){

    var total= Number($("#totalAmount").text());
    total-=getValueOfFilledLis(total);
    var totalPerJob=total/numberOfLis();
      $(".jobAmount").each(function(){
          if($(this).val()==""){
            $(this).val(totalPerJob.toFixed(2));
          }
       });
    if(ual()){
      
      // alert("Not Equal");
      confirm("NOTE: The amounts entered do not equal the total invoice amount.");
    }else{
      console.log("equal");
    }
    $("#jobNotes").val(getJobBreakdown());
    // console.log(getJobBreakdown().toString());
    requireNotes();

  
});
$(document).on("keydown",".jobAmount",function(event){
  if (event.which === 9) {
        addJob();
        // alert("tab");
    }
});
$(document).on('click','#breakdown',function(){
  console.log(getJobBreakdown());
  $(".budgetItem").each(function(){
    $(this).text();
  });
  // console.log($('.jobNumber').length);
  
});

$(".formattedBreakdown").html(formatString($(".formattedBreakdown").text()));


$(document).on("click","#jobCosted",function(){
  $(".jobList").show();
  location.reload();
});
$(document).on("click","#overhead",function(){
  $(".jobList").hide();
  requireNotes();
  $('#rejectNotes').show();
  // $(".jobList").empty();
  $('.jobNumber').each(function(){
    $(this).val("Overhead");
  });
});
$(document).on("change","#option1",function(){
  $(".jobList").show();
    location.reload();
  
});
$(document).on("change","#option2",function(){
  $(".jobList").hide();
  $('.jobNumber').val("");
  $('.budgetItem').val("");
  requireNotes();
});
$(document).on("change","#option3",function(){
  $(".jobList").hide();
  requireNotes()
});

$(document).on("change",".jobNumber",function(){
  $(this).siblings(".budgetItem").val("");
});

$(document).on("focus",".budgetItem",function(){
  var job= $(this).siblings(".jobNumber").val();
  var budget=getBudget(job);

  
  for(var i =0; i<budget.length; i++){
    $('.budgetItem').append($('<option>', {value:budget[i]}));
  }
  
  // $('.budgetItem').append($('<option>', {value:1, text:'One'}));
  
});
$(document).on("focusout",".budgetItem",function(){
  console.log('left');
  if($(this).val() !== null){
    $('.budgetItem').empty();
  }
});


function numberOfLis(){
  var totalLis=0;
  $(".jobAmount").each(function(){
    if($(this).val()==""){
      totalLis++
    }
  });
  return totalLis;
}
function getValueOfFilledLis(amount){
  var total=0;
  var liList = document.querySelectorAll(".jobAmount")
  liList.forEach(function(amount){
    total+=Number(amount.value);
  });
  // console.log("Value of Filled List: " + total);
  return total;
}
function ual(){
  var total=0;
  $(".jobAmount").each(function(){
    total+=Number($(this).val());
  });
  if(total - Number($("#totalAmount").text())>.01){
    console.log('greater than one');
  }else{
    console.log('less than one');
  }
  console.log(total - Number($("#totalAmount").text()));
  if(Math.abs(total - Number($("#totalAmount").text()))>.01){
    return true;
  }else{
    return false;
  }
}



function getJobBreakdown(){
    var jobs=[];
    var budget=[];
    var amounts=[];
    var jobBreakdown=[];
    
    $(".jobNumber").each(function(){
        jobs.push($(this).val());
    });
    $(".jobAmount").each(function(){
      amounts.push($(this).val());
    });
    $(".budgetItem").each(function(){
      // jquery inserting random values.  Checking to see if value is empty
      if($(this).val()){
        budget.push($(this).val());
      }

    })

    if(budget.length>0){
      for(var i =0; i<jobs.length; i++){
        jobBreakdown.push(" ( " + jobs[i] + ' [ '+budget[i] +  " ] : $" + Number(amounts[i]).toFixed(2) + " ) ");
      }
    }else{
      jobBreakdown.push("Notes:" + $('#rejectNotes').val());
    }
    
    return jobBreakdown;
}
 function formatString(format){
   var formatted=format.split(",").join("<br />");
   return "<span class=\"formattedBreakdown nowrap\">" + formatted + "</span>";
 }
 
 function requireNotes(){
   if($("#option1").is(':checked')){
      // $("#rejectNotes").prop('required',false);
      console.log("approved");
   }else{
     $("#rejectNotes").prop('required',true);
   }
 }
 
// read Budget Items and split them in to a list
 function getBudget(job){
  var jsonBudget=$('#hiddenPart').text();
  var budget = JSON.parse(jsonBudget);
  
  for(var i = 0; i<budget.length; i++){
    if(budget[i].jobNumber==job){

      return budget[i].budget
    }
  }
}
 
 function addJob(){
  // $(".jobList").append("<li class=\"col-xs-12 col-sm-6 col-md-6 jobBreakdown\"><input type=\"text\" class=\"form-control jobNumber\" placeholder=\"Job Number\"><input type=\"text\" class=\"form-control budgetItem\" placeholder=\"Budget Item\"><input type=\"number\" step=\"0.01\" class=\"form-control jobAmount\" placeholder=\"Amount\"><i class=\"fas fa-minus-square removeJob\"></i></li>");
    $(".jobList").append("<li class=\"col-xs-12 col-sm-6 col-md-6 jobBreakdown\"><input list=\"jobs\" name=\"job\" class=\"form-control jobNumber\" placeholder=\"Job\"><datalist id=\"jobs\" ><% jobs.forEach(function(job){ %><option value=\"<%= job.jobNumber + \": \" + job.jobDescription %>\"></option><% }) %></datalist><input list=\"budgetItem\" name=\"budgetItem\" class=\"form-control budgetItem\" placeholder=\"Phase and Cost Code\"><datalist id=\"budgetItem\" class = \"budgetItem\" autocomplete=\"off\"></datalist><input type=\"number\"  step=\".01\" class=\"form-control jobAmount\" placeholder=\"Amount\"><i class=\"fas fa-minus-square removeJob\"></i></li>")
 }
 
