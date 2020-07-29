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
var RELOAD = "reloadbutton";
var INS_INSTRUCTS = "instruct";
var INS_HEADER = "instr_header";
var PAGESIZE = 500;

var IMG_TIME = 100 // time to display images in ms

var SCALE_COMPLETE = false; // users do not need to repeat scaling

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
  var ret = `<video id="thisvideo" class="${mcl}\${ctr}" width="${PAGESIZE*1.05}px" height="${PAGESIZE*1.05}px">` +
      `<source src="${fmovnm}" type="video/mp4">` +
      `<source src="${foggnm}" type="video/ogg">` +
      `Your browser does not support HTML5 mp4 video.</video>`;
  return ret;
};

function textBox() {
	return `<div style="width:${PAGESIZE * 1.15}px;margin:auto;text-align:center">` +
    "<span id=\"qspan\">Write a description of the video </span> " +
    "<br>" +
    `<input id="text_box" type="text" name="inputbox" value="" style="font-size:14pt; width: ${PAGESIZE*1.05}px">`
    "</div>";
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
    this.showResponse = show_response;
    this.next = document.getElementById(NEXTBUTTON);
    this.next.disable = true;
    this.mvsc = document.getElementById(MOVIESCREEN);
    this.reloadbtn = document.getElementById(RELOAD);
  }

  // Loads content to the page
  // The `callback` argument can be used to handle page progression
  // or subject responses
  showPage(callback) {
    // create callback to progress when done
    this.next.onclick = function() {
      callback();
    };
    this.addText();
    // If there is a slider, then progression is contingent
    // on complete presentation of the media.
    this.addMedia();
  }


  // Returns the placement of each color scaled from [0, 1]
  retrieveResponse() {
    var textdata = document.getElementById("text_box");
    var rep = [textdata.value]
    return rep
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
    this.response.innerHTML = textBox();
  }

  // The form will automatically enable the next button
  enableResponse() {
	var box = document.getElementById("text_box");
    box.disabled = false;
   	box.onkeydown = function() { 
      allowNext();
    };
  }

  disableResponse() {
    document.getElementById("text_box").disabled = true;
  }

  clearResponse() {
    this.scale_region.innerHTML = "";
    this.response.innerHTML = "";
  }

  // plays movie
  showMovie() {

    this.next.disabled = true;
    var sc = document.getElementById(MOVIESCREEN);
    var mov = document.getElementById('thisvideo');

    let me = this;

    // The "next" botton will only activate after recording a response
    if (this.showResponse) {
      this.next.style.display = "none";
      var movOnEnd = function() {
        if (me.mask) {
          cut2black();
        }
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
      };
    }
    mov.oncanplaythrough = function() {
      mov.play();
    };
    mov.onended = movOnEnd;
  }

  showImage() {
    if (this.showResponse) {
      this.next.disabled = true;
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
      "In this study, your main task will be to watch a series of short videos. You will be asked to indicate what you believe just happened in the video by writing a description in a text box.<br><br>" +
        "In these videos, you will see simple objects such as balls, planks, floors, walls, tracks, and cups.",
      "image", "objects.png", false
    ],
    
    [
      "Here is an example of a dynamic scene you may see.<br>",
      "movie", "final_occlusion19.mp4", false // ADD THE EXAMPLE VIDEO
    ],
    
    [
      "These videos will start automatically and will only play once. You will not be able to pause the videos. There is a short countdown before each video, which you do not have to describe. You will be able to record your response by typing after the video has completed.<br>" +
        "<hr /><i>Note</i>: You will <b>NOT</b> be able to progress to the next trial until you have submitted your response.",
      "", "", false
    ],
    
    [
      "<b>Before we begin, follow the instructions below to setup your display.</b><br><hr />" +
        "<p>Please sit comfortably in front of you monitor and outstretch your arm holding a credit card (or a similary sized ID card). <br>" +
        "<p>Adjust the size of the image using the slider until its <strong>width</strong> matches the width of your credit card (or ID card).",
      "scale", "generic_cc.png", false
    ],
    
    [
      "Please maintain this arm-length distance from your monitor for the duration of this experiment (20-25 minutes).",
      "text", "", false
    ],
    
    ["After a short check to make sure that you have understood the instructions, " +
      "you will have to make your judgments about " + nTrials +  " trials.<br>", // name the number of trials
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
  var curidx = 0;
  var starttime = -1;

  // uses `Page` to show a single trial
  var runTrial = function(curIdx) {
    // We've reached the end of the experiment
    if (curIdx === triallist.length) {
      end();
    }
    var flnm = triallist[curIdx];
    //show_progress(curIdx);
    starttime = new Date().getTime();
    var pg = new Page("", "movie", flnm, true);
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
    var rt = new Date().getTime() - starttime;
    var rep = trialPage.retrieveResponse();
    psiTurk.recordTrialData({
      'TrialName': triallist[cIdx],
      'Response': rep[0],
      'ReactionTime': rt,
      'IsInstruction': false,
      'TrialOrder': cIdx
    });
  };

  var end = function() {
    psiTurk.saveData();
    new Questionnaire();
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

  // Load in the conditions
  // TEMPORARY

  function do_load() {
    $.ajax({
      dataType: 'json',
      url: "static/data/condlist.json",
      async: false,
      success: function(data) {
        condlist = shuffle(data[condition]);
        InstructionRunner(condlist);
      },
      error: function() {
        setTimeout(500, do_load)
      },
      failure: function() {
        setTimeout(500, do_load)
      }
    });
  };

  do_load();

});
