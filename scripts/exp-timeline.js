/* global vars (needed to advance past instructions) */
var check_score = 0;
var total_bonus = 0;

/* initialize jsPsych */
var jsPsych = initJsPsych({
    on_finish: function() {
      console.log('Done with the task!')
      // Submit data
      var urlParams = parseURLParams(window.location.href);

      data = {
        worker: (urlParams.workerId === undefined)? '' : urlParams.assignmentId[0],
        assignment: (urlParams.assignmentId === undefined)? '' : urlParams.assignmentId[0],
        hit: (urlParams.hitId === undefined)? '' : urlParams.hitId[0],
        timestamp: Date.now(),
        version: 'ENTER A DESCRIPTIVE NAME FOR YOUR EXPERIMENT',
        data: jsPsych.data.get().json()
      };

      $('body').load('templates/debrief.html', function(){
        $('#total-bonus').html(sprintf('$%0.2f', total_bonus));
      });

      if (urlParams.hasOwnProperty('debug')) {
        console.log(data);
      } else {
        save_data(data);
      }
    },
    show_progress_bar: true
  });

  /* preload images (DEMO) */
  const preload_images = _.range(1,51).map(function(e) {return sprintf('images/widget_%02d.jpg', e)}); 

  /* define experiment timeline */
  const timeline = [
    {
      type: jsPsychPreload,
      images: preload_images
    },
    {
      type: consent // CoLab custom plugin
    },
    {
      type: jsPsychFullscreen
    },
    {
      type: post_survey // CoLab custom plugin
    }
];

  /* start the experiment */
  jsPsych.run(timeline);


