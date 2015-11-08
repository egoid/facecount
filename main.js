'use strict';


$(document).ready(function() {
  let currentCtx;
  let key;
  let faces = [];
  let imageParams = {
    // Request parameters
    "analyzesFaceLandmarks": "false",
    "analyzesAge": "true",
    "analyzesGender": "true",
    "analyzesHeadPose": "true"
  };

  $('#pic1, #pic2').click(detectFaces);

  function detectFaces() {
    key = $('#key').val();
    let url;
    console.log('key:', key);
    console.log('faces:', faces, ', faces.length:', faces.length);

    if ($(this).attr('id') === 'pic1') {
      console.log('detecting on pic 1');
      url = $('#urlone').val();
      // $('#pic1').prop('disabled', 'true');
    } else {
      console.log('detecting on pic 2');
      url = $('#urltwo').val();
      // $('#pic2').prop('disabled', 'true');
    }

    // display the picture currently being processed in the DOM
    var newImg = $('<img>').attr('src', url);
    var newW = newImg[0].naturalWidth
    var newH = newImg[0].naturalHeight

    // $('#pictures').append($newDiv)
    var $newCanvas = $('<canvas>');
    $newCanvas.css('background', 'url(' + url + ')');
    $newCanvas.attr('width',newW);
    $newCanvas.attr('height',newH);
     $('#pictures').append( $newCanvas );
     currentCtx = $newCanvas[0].getContext('2d');


     //DEBUG

    // oh dear, this is callback hell...
    $.ajax( paramForDetect(url) )
    .done(function(data) {
      console.log("we've got face data:", data);

      let newFaces = [];
      let newFaceIds = [];

      data.forEach((person) => {
        // if the face is not already in our faces array, add it
        if (faces.length > 0) {
          let haveAlreadyp = verifyFace(person.faceId, faces[0].faceId);
          $.when(haveAlreadyp).then((data) => {
            if (!data.isIdentical) addPerson(person);
          });
        } else {
          addPerson(person);
        }
      });

    })
    .fail(function(err) {
      console.log(err);
      console.log('Detect-Faces Failed');
    });

  }; // end detectFaces function


  function addPerson(person) {
    // update our array of known faces
    faces.push(person);
    console.log('faces array:', faces);

    // print the new face ID to the DOM
    let attrs = person.attributes;
    console.log('person:', attrs.gender, attrs.age);
    let $row = $('<tr>').append( $('<td>').text(person.faceId) )
                        .append( $('<td>').text(attrs.gender) )
                        .append( $('<td>').text(attrs.age) );
    $('#faceIds').append($row).show();
    
            console.log(currentCtx)
            currentCtx.strokeStyle = '#df4b26';
            currentCtx.lineJoin = 'round' ;
            currentCtx.lineWidth = 5;
            var x = person.faceRectangle.left;
            var y = person.faceRectangle.top;
            var w = person.faceRectangle.width;
            var h = person.faceRectangle.height;

            console.log( x + ' , ' + y + ' , ' + w + ' , '+ h)
            currentCtx.beginPath();
            currentCtx.moveTo(x ,y);
            currentCtx.lineTo(x+w,y);
            currentCtx.lineTo(x+w,y+h);
            currentCtx.lineTo( x ,y+h);
            currentCtx.lineTo( x ,y);
            currentCtx.closePath();
            currentCtx.stroke();
            console.log(currentCtx)
            
  }


  function paramForDetect(url) {
    return {
      url: 'https://api.projectoxford.ai/face/v0/detections?' + $.param(imageParams),
      beforeSend: function(xhrObj){
        // Request headers
        xhrObj.setRequestHeader("Content-Type","application/json");
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", key);
      },
      type: 'POST',
      data: `{'url': '${url}'}`
    };
  }

  function verifyFace(faceId1, faceId2) {
    return $.ajax( paramForVerify({"faceId1":faceId1, "faceId2":faceId2}) )
    .fail(function(err) {
      console.log(err);
      console.log('Verify-Face Failed for:', faceId1, 'vs', faceId2);
    });
  }

  function paramForVerify(faceIds) {
    return {
      url: 'https://api.projectoxford.ai/face/v0/verifications',
      beforeSend: function(xhrObj){
        // Request headers
        xhrObj.setRequestHeader("Content-Type","application/json");
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", key);
      },
      type: 'POST',
      data: JSON.stringify(faceIds)
    };
  }

});
