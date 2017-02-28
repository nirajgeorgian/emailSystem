var simplemde = new SimpleMDE({ element: document.getElementById("MyID") });
// Handling the click event
var tag = document.getElementById('tag')
if(tag) {
  tag.addEventListener('keyup', function(event) {
    event.preventDefault()
    if(event.keyCode == 13) {
      tag.click()
    }
  })
}

var tagA = document.getElementById('tagsAdd')
if (tagA) {
  tag.addEventListener('keyup', function(event) {
    event.preventDefault()
    if(event.keyCode == 13) {
      tag.click()
    }
  })
}

$(function() {
  var date_input = $('input[name="date"]')
  var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
  var options = {
    autoclose: true,
    format: 'yyyy/mm/dd',
    container: container,
    todayHighlight: true
  }
  date_input.datepicker(options)
  $('#addnote').on('click', function(e) {
    e.preventDefault()
    $('form[name="userForm"]').attr('action', '/user/addnote')
    $(this.form).submit()
  })
  $('#sendmail').on('click', function(e) {
    e.preventDefault()
    $('form[name="userForm"]').attr('action', '/user/sendmail')
    $(this.form).submit()
  })
})

$(function() {
  $('#tagSearch').keyup(function() {
    $('#tagSearchForm').submit(function(e) {
      e.preventDefault()
    })
    var tagsearch = $(this).val()
    if (tagsearch == "") {
      location.reload();
    }
    $.ajax({
      method: 'POST',
      url: '/search/tags',
      data: {
        tagsearch
      },
      dataType: 'json',
      success: function(json) {
        $('#searchResult').empty()
        if(json.length != undefined) {
          var html = ""
          html += '<tr>';
          html += '<td> 1 </td>';
          html += '<td>' + json[0].tag_name +'</td>'
          html += '<td><a type="button" name="edit" class="btn btn-default" href="/tags/edit/' + json[0].tag_name + '">Edit</a></td>'
          html += '<td><a type="button" name="Delete" class="btn btn-danger" href="/tags/delete/'+ json[0].tag_name + '">Delete</a></td>'
          html += '</tr>'
          $('#searchResult').append(html)
          console.log(json[0]);
        } else {
          // var html += ""
          // html += '<h2>'
        }
      },
      error: function(error) {
        console.log(error)
      }
    })
  })
})
// $(function() {
//   $('.taskDoneBox').click(function() {
//     if ($(this).attr("value") == "false") {
//       $(this).attr("value", "true")
//       var qwe = $(this > 'strong')
//       var result = $(this).val()
//       var resu = $(this).prev()
//       console.log(qwe);
//       // $.ajax({
//       //   method: 'GET',
//       //   url: '/stat',
//       //   data: {
//       //     taskUsername
//       //   },
//       //   dataType: "text",
//       //   success: function(data) {
//       //     console.log(data)
//       //   },
//       //   error: function(err) {
//       //     console.log(err)
//       //   }
//       // })
//     } else {
//       $(this).attr("value", "false")
//       $('#taskDone').text("false")
//       var result = $(this).val()
//       var res = $('#checkSubject').text()
//       console.log(result);
//     }
//   })
// })

$(function() {
  $('.taskForm').on("change", "input:checkbox",function() {
    $(this.form).submit();
  })
})
