/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition; 

// Names of elements used in the experiment
var MOVIESCREEN = "moviescreen";
var DRAGBOX = "dragbox"
var NEXTBUTTON = "nextbutton";
var PROGRESS = "progress";
var RELOAD = "reloadbutton";
var RES_SLIDER = "trialRes";
var INS_INSTRUCTS = "instruct";
var INS_HEADER = "instr_header";
var PAGESIZE = 500;

var IMG_TIME = 100 // time to display images in ms

var SCALE_COMPLETE = false; // users do not need to repeat scaling

var PROLIFIC_ID = "";

// All pages to be loaded
var pages = [
  "instructions/instructions.html",
  "instructions/instruct-1.html",
  "quiz.html",
  "restart.html",
  "stage.html",
  "postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
  "instructions/instruct-1.html"
];



/****************
 * Prolific ID  *
 ****************/

var ProlificID = function(condlist) {
    while (true) {
        PROLIFIC_ID = prompt("Please enter Prolific ID to proceed:");
        // a small check on length
        if (PROLIFIC_ID.length == 24) {
            psiTurk.recordTrialData({
                'prolific_id': PROLIFIC_ID,
            });
            console.log("prolific_id recorded:", PROLIFIC_ID);
            InstructionRunner(condlist);
            return;
        }
        alert("Make sure you enter the Prolific ID correctly, please try again.");
    }
}


/****************
 * Functions  *
 ****************/

// used to shuffle the array of trials
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};


var black_div = function() {
  return '<div style=\"background-color: black; width: 1280px; height: 720px;\"></div>'
}

var cut2black = function() {
  var sc = document.getElementById(MOVIESCREEN);
  sc.innerHTML = make_img("mask.png", true, false) + "<br>";
}

var make_img = function(imgname, is_intro, freeze) {
  if (typeof(is_intro) === 'undefined') is_intro = false;
  if (typeof(freeze) === 'undefined') freeze = true
  var mcl = "movieobj"
  if (is_intro) {
    mcl = "movieobj_sm"
  }
  var r = "<image id=\"thisimg\" "
  if (freeze) {
    r += "onload=\"cut2black()\" "
  }
  r += `class="${mcl}" src="static/data/${imgname}" alt="Movie" style="height: auto; width: ${PAGESIZE}px">`
  return r
};

var make_mov = function(movname, is_intro, has_ctr) {
  if (typeof(is_intro) === 'undefined') is_intro = false;
  if (typeof(has_ctr) === 'undefined') has_ctr = true;
  var mcl = "movieobj";
  var ctr = "";
  var fmovnm = "static/data/movies/" + movname;
  var foggnm = fmovnm.substr(0, fmovnm.lastIndexOf('.')) + ".ogg";
  var ret = //`<span id="qspan">Press spacebar when you see a video distortion</span>` +
   `<video id="thisvideo" style="border: solid transparent; margin-top: ${PAGESIZE*.2}px; margin-bottom: ${PAGESIZE*.2}px;" class="${mcl}\${ctr}" width="${PAGESIZE*1.05}px">` +
      `<source src="${fmovnm}" type="video/mp4">` +
      `<source src="${foggnm}" type="video/ogg">` +
      `Your browser does not support HTML5 mp4 video.</video>`;
  return ret;
};


/********************
 * HTML manipulation
 *
 * All HTML files in the templates directory are requested
 * from the server when the PsiTurk object is created above. We
 * need code to get those pages from the PsiTurk object and
 * insert them into the document.
 *
 ********************/

function allowNext() {
  var button = document.getElementById(NEXTBUTTON)
  button.disabled = false;
  button.style.display = "inline-block";
}

function scaleSlider() {
  return "<span id=\"qspan\">Move the slider to match the width of your card</span>"+
    "<input id=\"scale_slider\" type=\"range\" min=\"0\" max=\"100\" default=\"50\" width=\"1500\"/>";
};


function responseSlider() {
  return `<span id="qspan">How confident are you in your response?</span>` +
    `<div id="lab-div">` +
    `<div id="lab-left"><i>Not confident at all</i></div>` +
    `<div id="lab-center"><i>Somewhat confident</i></div>` +
    `<div id="lab-right"><i>Very confident</i></div>` +
    `</div>` +
    `<input id="response_slider" type="range" min="0" max="100" default="50" width="${PAGESIZE*1.05}px" disabled/>`
};

// collect response time during video and indicate when a key is press 
function draw(duration) {

  var video = document.getElementById('thisvideo');
  video.style.borderColor = "red";
  //var x = document.createElement("CANVAS");
  //var ctx = x.getContext("2d");
  
  //ctx.drawImage(video, 0, 0, video.videoWidth,video.videoHeight);
  
  // ctx.strokeStyle = "#FF0000";
  // ctx.strokeRect(0,0,video.videoWidth,video.videoHeight);

  setTimeout(function(){
    video.style.borderColor = "transparent";
  	//x.parentNode.removeChild(x);
  	},duration);
    
   // document.body.appendChild(x);
 
}
    
// Collect choice after watching video
// var choiceRegion = function () {
//     var choice_test =`<h4> Did you see a letter? <span style=\"color:blue;\"></span></h4>`+
//      `<ul style="list-style-type:none">`+ 
//         `<li id="e-choice">`+
//         `<input id="e-choice" type="radio" name="choice" value="1"/>` +
//         `<div class="check"></div>`+
//         `<label for="e-choice"><i>E</i></label>` +
//         `</li>` +
//         `<li id="f-choice">` +
//         `<input id="f-choice" type="radio"  name="choice" value="2"/>` +
//         `<div class="check"></div>` +
//         `<label for="f-choice"><i>F</i></label>` +    
//         `</li>` +
//         `<li id="no-choice">` +
//         `<input id="no-choice" type="radio"  name="choice" value="0"/>` +
//         `<div class="check"></div>` +
//         `<label for="no-choice"><i>No letter</i></label>` +    
//         `</li>` +
//         `</ul>`;
//     return choice_test;
// }


// open the video full screen
function toggleFullScreen(elem) {

// open the full screen
	if (!document.fullscreenElement) {
  		if (elem.requestFullscreen) {
    		elem.requestFullscreen();
  		} else if (elem.webkitRequestFullscreen) { /* Safari */
    		elem.webkitRequestFullscreen();
  		} else if (elem.msRequestFullscreen) { /* IE11 */
    		elem.msRequestFullscreen();
    	}
  	} else 
  	// close the full screen
  	 {
  		if (elem.exitFullscreen) {
    		elem.exitFullscreen();
  		} else if (elem.webkitExitFullscreen) { /* Safari */
    		elem.webkitExitFullscreen();
  		} else if (elem.msExitFullscreen) { /* IE11 */
    		elem.msExitFullscreen();
		}
	}	
}



class Page {

  // Handles media presentation and scale handling.

  /*******************
   * Public Methods  *
   *******************/
  constructor(text, mediatype, mediapath, show_response = false) {
    // page specific variables
    this.text = text;
    this.mediatype = mediatype;
    this.mediapath = mediapath;
    this.mask = false;
    this.pageSize = PAGESIZE;
    // html elements
    this.instruct = document.getElementById(INS_INSTRUCTS);
    this.scale_region = document.getElementById("scale_region");
    this.response = document.getElementById("response_region");
    this.choice = document.getElementById(RES_SLIDER);
    this.showResponse = show_response;
    this.next = document.getElementById(NEXTBUTTON);
    this.next.disable = true;
    this.mvsc = document.getElementById(MOVIESCREEN);
    this.reloadbtn = document.getElementById(RELOAD);
    this.ekey = [];
    this.fkey = [];
  }

  // Loads content to the page
  // The `callback` argument can be used to handle page progression
  // or subject responses
  showPage(callback) {
    // create callback to progress when done
    this.next.onclick = function() {
      callback();
    };
    
	// preventing from scrolling on space bar click
	window.addEventListener('keydown', function(e) {
		if(e.keyCode == 32 && e.target == document.body) {
			e.preventDefault();
		}
	});
	
    this.addText();
    
    // If there is a slider, then progression is contingent
    // on complete presentation of the media.
    this.addMedia();
  }


  // Returns the placement of each color scaled from [0, 1]
  retrieveResponse() {
    var confidence = document.getElementById("response_slider");
    //var choice = $('input[name=clothchoice]:checked', `#${RES_SLIDER}`).val();  
    //var rep = [choice, confidence.value]   
    return confidence.value
  }
  
    // Return the spacebar presses
  	get_keypresses() {
        return [this.ekey, this.fkey];
  }
  
  
  /************
   * Helpers  *
   ***********/

  // injects text into page's inner html
  addText() {
    if (this.text !== "") {
      this.instruct.innerHTML = this.text;
    }
  }

  // formats html for media types
  addMedia() {
    if (this.mediatype === 'image') {
      this.mvsc.innerHTML = make_img(this.mediapath, true, false) + "<br>";
      this.showImage();
    } else if (this.mediatype === 'movie') {
      this.mvsc.innerHTML = make_mov(this.mediapath, true);
      this.showMovie();
    } else if (this.mediatype == 'scale'){
      this.mvsc.innerHTML = make_img(this.mediapath, true, false) + "<br>";
      this.scalePage();
    } else {
      this.mvsc.innerHTML = "";
      this.showImage();
    }
  };

  scalePage() {
    if (SCALE_COMPLETE) {
      this.mvsc.innerHTML = "";
      this.instruct.innerHTML = "You have already scaled your monitor";
      this.showImage();

    } else {
      this.scale_region.innerHTML = scaleSlider();
      var slider_value = document.getElementById("scale_slider");
      var scale_img = document.getElementById("thisimg");
      slider_value.oninput = function(e) {
        PAGESIZE = (e.target.value / 50.0) * 500;
        scale_img.width = `${PAGESIZE}px`;
        scale_img.style.width = `${PAGESIZE}px`;
        SCALE_COMPLETE = true;
      }
    }
  }
  
  addResponse() {
    this.response.innerHTML = responseSlider();
  }
  
  //addChoice() {
  //  this.choice.innerHTML = choiceRegion();
  //}


  // The form will automatically enable the next button
  enableResponse() {
	var box = document.getElementById("response_slider");
    box.disabled = false;
   	box.onmousedown = function() { 
      allowNext();
    };
  }

  disableResponse() {
    document.getElementById("response_slider").disabled = true;
  }

  clearResponse() {
    this.scale_region.innerHTML = "";
    this.response.innerHTML = "";
    //this.choice.innerHTML = "";
  }
  

  // plays movie
  showMovie() {

	var starttime = new Date().getTime();
	
    this.next.disabled = true;
    var sc = document.getElementById(MOVIESCREEN);
    var mov = document.getElementById('thisvideo');

    let me = this;

	
	// add timing for any key presses that were made 
	document.onkeyup = function(event){
		if (event.keyCode === 69) {
			event.preventDefault();
			
			var time = new Date().getTime() - starttime;
			if (time > 500 && me.next.disabled === true) {
				// tell them
				//tempAlert('space',500)

				 // outline the video
				draw(500)
				 
				 // save the data
				 me.ekey.push(time); 
                    
              }
        } else	if (event.keyCode === 70) {
			event.preventDefault();
			
			var time = new Date().getTime() - starttime;
			if (time > 500 && me.next.disabled === true) {
				// tell them
				//tempAlert('space',500)

				 // outline the video
				draw(500)
				 
				 // save the data
				 me.fkey.push(time); 
                    
              }
        }
    };

    // The "next" botton will only activate after recording a response
    if (this.showResponse) {
      this.next.style.display = "none";
      var movOnEnd = function() {
        if (me.mask) {
          cut2black();
        }
        toggleFullScreen(mov)
        //me.addChoice();
        me.addResponse();
        me.enableResponse();
      };
      
    } else {
      // Otherwise allow next once movie is complete
      var movOnEnd = function() {
        if (me.mask) {
          cut2black();
        }
        me.next.disabled = false;
       toggleFullScreen(mov)
       
      };
    }
    mov.oncanplaythrough = function() {
      toggleFullScreen(mov)
      mov.controls=false;
      mov.play();
    };
    
    mov.onended = movOnEnd;
    
  }
  
// shows an image
  showImage() {
    if (this.showResponse) {
      this.next.disabled = true;
      //this.addChoice();
      this.addResponse();
      this.enableResponse();
    } else {
      this.next.disabled = false;
    }
  }
};

/****************
 * Instructions  *
 ****************/

var InstructionRunner = function(condlist) {
  psiTurk.showPage('instructions/instructions.html');

  var instruct = document.getElementById(INS_INSTRUCTS);
  var dragbox = document.getElementById(DRAGBOX);
  var mvsc = document.getElementById(MOVIESCREEN);
  var reloadbtn = document.getElementById(RELOAD);
  var nTrials = condlist.length;

  // each instruction is an array of 4 elements
  // 1: The text to be shown (if any)
  // 2: The type of format (image, movie, text, scale)
  // 3: Any media needed (can be an empty string)
  // 4: Whether to show the response div (true/false) // not sure what this means

  var instructions = [
  
      [
      "<b>Before we begin, follow the instructions below to setup your display.</b><br><hr />" +
        "<p>Please sit comfortably in front of you monitor and outstretch your arm holding a credit card (or a similary sized ID card). <br>" +
        "<p>Adjust the size of the image using the slider until its <strong>width</strong> matches the width of your credit card (or ID card).",
      "scale", "generic_cc.png", false
    ],
  
    [
      "Please maintain this arm-length distance from your monitor for the duration of this experiment (30-45 minutes).",
      "text", "", false
    ],
  
  
    [
      "In this study, your main task will be to watch a series of short videos. You will be asked to indicate whether or not you saw a letter (either <b>E</b> or <b>F</b>) flash somewhere on the screen, and your confidence in that decision." +
        "In these videos, you will see simple objects such as balls, planks, floors, walls, tracks, and cups.",
      "image", "objects.png", false
    ],
    
    [
      "We will first show you two videos as examples and for practice. Your task is to pay close attention to the video and to press the <b>E</b> or <b>F</b> key to indicate when you saw a letter flash on the screen."+ 
      "When you press the  <b>E</b> or <b>F</b> key, a red border will flash around the video to indicate that your response was recorded.<br>"+
      "If no letter flashes, please do not press anything, and simply wait until the video ends. Afterwards, you will indicate your confidence in detecting the letter or not. <br> " + 
      "Note that not every video will have a letter flash on the screen.",
      "image", "spatial_probe_keyboard.png", false
    ],
    
    [
      "Click next to see an example of a dynamic scene in which <b>no letter flashes</b>. <br>",
      "", "", false
    ],
    
    [
      "Here is an example of a dynamic scene in which no letter flashes.<br>",
      "movie", "example_containment_topple_collision.mp4", false // ADD THE EXAMPLE VIDEO
    ],
    
    [
      "Great! Click next to see an example of a dynamic scene in which a letter (<b>E</b>) does flash. Watch carefully to see the frame that looks like the image below." +
      "When you see the letter <b>E</b>, press the <b>E</b> key on the keyboard as practice.",
      "image", "example_spatial_probe_screenshot.png", false
    ],
    [
      "Here is an example of a dynamic scene in which a letter does flash (watch carefully)<br>",
    "movie", "example_containment_topple_collision_T1.mp4", false // ADD THE EXAMPLE VIDEO
    ],
    
    [
      "These videos will start automatically and will only play once. You will not be able to pause or rewind the videos. During the video, please indicate if you saw either an <b>E</b> or <b>F</b> by pressing the appropriate key. After the video ends, you will be able to record your how confident you are in it. You will drag a slider ranging from 'Not very confident' to 'Very confident' in your answer.<br>" +
        "<hr /><i>Note</i>: You will <b>NOT</b> be able to progress to the next trial until you have submitted your confidence response.",
      "", "", false
    ],
    
    
    ["We will now have a short check to make sure that you have understood the instructions." +
      "Then you will have to make your judgments about " + nTrials +  " trials.<br>", // name the number of trials
      "", "", false
    ],

  ];
  
  var ninstruct = instructions.length;

  // Plays next instruction or exits.
  // If there is another page, it is reach via callback in `page.showPage`
  var do_page = function(i) {

    if (i < ninstruct) {
      var page = new Page(...instructions[i]);
      page.showPage(function() {
        page.clearResponse();
        do_page(i + 1);
      });
    } else {
      end();
    }
  };

  var end = function() {
    psiTurk.finishInstructions();
    quiz(function() {
        InstructionRunner(condlist)
      },
      function() {
        currentview = new Experiment(condlist)
      })
  };

  // start the loop
  do_page(0);
};

/*********
 * Quiz  *
 *********/

// Describes the comprehension check
var loop = 1;
var quiz = function(goBack, goNext) {
  function record_responses() {
    var allRight = true;
    $('select').each(function(i, val) {
      psiTurk.recordTrialData({
        'phase': "INSTRUCTQUIZ",
        'question': this.id,
        'answer': this.value
      });
      if (this.id === 'trueFalse1' && this.value != 'b') {
        allRight = false;
      } else if (this.id === 'trueFalse2' && this.value != 'c') {
        allRight = false;
      }
      // }else if(this.id==='densOrder' && this.value != 'second'){
      //     allRight = false;
      // }
    });
    return allRight
  };

  psiTurk.showPage('quiz.html')
  $('#continue').click(function() {
    if (record_responses()) {
      // Record that the user has finished the instructions and
      // moved on to the experiment. This changes their status code
      // in the database.
      psiTurk.recordUnstructuredData('instructionloops', loop);
      psiTurk.finishInstructions();
      console.log('Finished instructions');
      // Move on to the experiment
      goNext();
    } else {
      // Otherwise, replay the instructions...
      loop++;
      psiTurk.showPage('restart.html');
      $('.continue').click(
        function() {
          psiTurk.doInstructions(instructionPages, goBack)
        });
    }
  });
};

/**************
 * Experiment *
 **************/

var Experiment = function(triallist) {

  psiTurk.showPage('stage.html');
  
  var triallist = shuffle(triallist);
  
  var screen = document.getElementById(MOVIESCREEN);
  var button = document.getElementById(NEXTBUTTON);
  var reloadbtn = document.getElementById(RELOAD);
  var prog = document.getElementById(PROGRESS);
  
  var starttime = -1;

  // uses `Page` to show a single trial
  var runTrial = function(curIdx) {
  
    // We've reached the end of the experiment
    if (curIdx === triallist.length) {
      end();
    }
    
    var flnm = triallist[curIdx];
    
    show_progress(curIdx);
    
    starttime = new Date().getTime();
    var pg = new Page("Pay attention for an <b>'E'</b> or <b>'F'</b> flashing on the screen", "movie", flnm, true);
    
    // `Page` will record the subject responce when "next" is clicked
    // and go to the next trial
    
    pg.showPage(
      function() {
      	
        register_response(pg, curIdx);
        
        // Clears slider from screen
        pg.clearResponse();
        runTrial(curIdx + 1);
        
      }
    );
  };
  


  // Record the subject's response for a given trial.
  var register_response = function(trialPage, cIdx) {
  
    //var rt = new Date().getTime() - starttime;
    var rep = trialPage.retrieveResponse();
    var keys = trialPage.get_keypresses();
    
    psiTurk.recordTrialData({
      'TrialName': triallist[cIdx],
      //'Choice': rep[0],
      'Confidence': rep,
      'E_Key':keys[0],
      'F_Key':keys[1],
      'IsInstruction': false,
      'TrialOrder': cIdx
    });
  };

  var end = function() {
    psiTurk.saveData();
    new Questionnaire();
  };
  
	// show current trial number
    var show_progress = function(cIdx) {
        prog.innerHTML = (cIdx + 1) + " / " + (triallist.length);
    };

  // Let's begin!
  runTrial(0);
};



/****************
 * Questionnaire *
 ****************/

var Questionnaire = function() {

  var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

  record_responses = function() {

    psiTurk.recordTrialData({
      'phase': 'postquestionnaire',
      'status': 'submit'
    });

    $('textarea').each(function(i, val) {
      psiTurk.recordUnstructuredData(this.id, this.value);
    });
    $('select').each(function(i, val) {
      psiTurk.recordUnstructuredData(this.id, this.value);
    });

  };

  prompt_resubmit = function() {
    document.body.innerHTML = error_message;
    $("#resubmit").click(resubmit);
  };

  resubmit = function() {
    document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
    reprompt = setTimeout(prompt_resubmit, 10000);

    psiTurk.saveData({
      success: function() {
        clearInterval(reprompt);
        psiTurk.computeBonus('compute_bonus', function() {
          finish()
        });
      },
      error: prompt_resubmit
    });
  };

  // Load the questionnaire snippet
  psiTurk.showPage('postquestionnaire.html');
  psiTurk.recordTrialData({
    'phase': 'postquestionnaire',
    'status': 'begin'
  });

  $("#next").click(function() {
    record_responses();
    psiTurk.saveData({
      success: function() {
        psiTurk.completeHIT(); // when finished saving compute bonus, the quit
      },
      error: prompt_resubmit
    });
  });


};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/

$(window).load(function() {

  // Load in the conditions which have been balanced off-screen
  function create_conds() {
  $.ajax({
	type: "POST",
	url: '/create_tasklist',
	aync: false,
	});
  
}

  function do_load() {
    $.ajax({
      dataType: 'json',
      url: "static/data/condlist.json",
      async: false,
      success: function(data) {
        condlist = shuffle(data[condition]);
        InstructionRunner(condlist);
        ProlificID(condlist);
      },
      error: function() {
        setTimeout(500, do_load)
      },
      failure: function() {
        setTimeout(500, do_load)
      }
    });
  };
    
  create_conds();
  do_load();

});
