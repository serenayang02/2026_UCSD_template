var post_survey = (function (jspsych) {
    "use strict";
  
    const info = {
      name: "post_survey",
      parameters: {
      },
    };
  
    /**
     * ** POST-TEST SURVEY **
     *
     * DISPLAYS A DEMOGRAPHIC SURVEY AT THE END OF THE TASK
     *
     * @author NATALIA VELEZ
     */
    class PostSurveyPlugin {
      constructor(jsPsych) {
  
        this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // set up page
          $(display_element).load('templates/survey.html', function(){

              // Safety net: prevent the browser's native form-submit behavior entirely.
              // Without this, any <button> inside <form> that's missing type="button"
              // defaults to type="submit", which makes the browser reload the page and
              // append all field values to the URL as query params (the bug we hit here).
              $('form.post-survey').on('submit', function(e) {
                  e.preventDefault();
              });

              // type="number" doesn't reliably block letters in every browser
              // (e.g. Firefox lets you type them, it just marks the field invalid
              // rather than preventing the keystroke) — strip anything non-digit
              // as the participant types, so the field can never hold letters
              $('#survey-age').on('input', function() {
                  this.value = this.value.replace(/[^0-9]/g, '');
              });

              // Page navigation logic
              // Using jQuery, consistent with the rest of the project's coding style
              // Every question on this survey is optional and skippable — the only
              // required step in the whole experiment is the consent checkbox
              // (handled separately in plugin-consent.js). So "Next" always advances,
              // regardless of what has or hasn't been filled in on page 1.
              $('.next-page').on('click', function() {
                  $('.survey-page-1').hide();
                  $('.survey-page-2').show();
              });

              $('.back-page').on('click', function() {
                  $('.survey-page-2').hide();
                  $('.survey-page-1').show();
              });

              // Star/fire rating widget
              // Reusable function: attaches hover-preview + click-to-lock behavior to a group of stars
              function setupStarRating(containerId, descriptionId, descriptions) {
                  var container = document.querySelector('#' + containerId);
                  var description = document.querySelector('#' + descriptionId);
                  var stars = container.querySelectorAll('.star');

                  function lightUpTo(n) {
                      stars.forEach(function(star) {
                          var val = parseInt(star.dataset.value);
                          if (val <= n) {
                              star.classList.add('lit');
                          } else {
                              star.classList.remove('lit');
                          }
                      });
                  }

                  stars.forEach(function(star) {
                      star.addEventListener('mouseenter', function() {
                          var hoverValue = parseInt(star.dataset.value);
                          lightUpTo(hoverValue);
                          description.textContent = descriptions[hoverValue];
                      });
                      star.addEventListener('click', function() {
                          var clickedValue = parseInt(star.dataset.value);
                          container.dataset.selected = clickedValue;
                      });
                  });

                  container.addEventListener('mouseleave', function() {
                      var selected = parseInt(container.dataset.selected);
                      lightUpTo(selected);
                      description.textContent = selected > 0 ? descriptions[selected] : "";
                  });
              }

              setupStarRating('game-stars', 'game-description', {
                  1: "No experience — you have never played video games",
                  2: "Beginner / Casual player — you have played a few games casually and know basic controls",
                  3: "Intermediate — you play games somewhat regularly and understand how most game mechanics work",
                  4: "Advanced — you're very comfortable with complex games and consider yourself a skilled player"
              });

              setupStarRating('fun-stars', 'fun-description', {
                  1: "Not fun", 2: "Less fun than average", 3: "Average",
                  4: "More fun than average", 5: "Very fun!"
              });

              setupStarRating('hard-stars', 'hard-description', {
                  1: "Very easy", 2: "Somewhat easy", 3: "Neither easy nor hard",
                  4: "Somewhat hard", 5: "Very hard"
              });

              setupStarRating('clear-stars', 'clear-description', {
                  1: "Very confusing", 2: "Somewhat confusing", 3: "OK, but could be clearer",
                  4: "Mostly clear", 5: "Very clear"
              });

              // When "game-nosay" is checked, clear the game-experience stars to avoid conflicting answers
              $('#game-nosay').on('change', function() {
                  var gameStars = document.querySelector('#game-stars');
                  if (this.checked) {
                      gameStars.dataset.selected = 0;
                      gameStars.querySelectorAll('.star').forEach(function(s){ s.classList.remove('lit'); });
                      document.querySelector('#game-description').textContent = "";
                  }
              });

              // Show the "please describe" textarea only when the participant answers "Yes"
              // to the bugs question; hide and clear it if they answer "No"
              $('input[name="survey-bugs"]').on('change', function() {
                  if ($('#bugs-y').is(':checked')) {
                      $('#bug-details-group').show();
                  } else {
                      $('#bug-details-group').hide();
                      $('#bug-details').val('');
                  }
              });

              // initialize button — the page now has Next/Back/Submit buttons,
              // must target '.submit' specifically so only the Submit click is captured
              $(display_element).find('button.submit').one('click', function(){
                $(this).unbind('click');

                // race/ethnicity is a checkbox group (multi-select), so it's extracted differently than radios:
                // .map() collects the value of every checked checkbox into an array
                var race_selected = $(display_element).find('input[name="survey-race"]:checked')
                    .map(function(){ return this.value; }).get();

                var trial_data = {
                    // ---- Page 1 ----
                    country : $(display_element).find('#survey-country').val(),
                    age : $(display_element).find('#survey-age').val(),
                    gender_cat : $(display_element).find('input[name="survey-gender"]:checked').val(),
                    gender_text : $(display_element).find('#gender-other').val(),
                    race : race_selected,
                    race_text : $(display_element).find('#race-other-text').val(),
                    education : $(display_element).find('input[name="survey-education"]:checked').val(),
                    language : $(display_element).find('#survey-language').val(),
                    english_level : $(display_element).find('input[name="survey-english"]:checked').val(),

                    // ---- Page 2 ----
                    game_experience : $(display_element).find('#game-nosay').is(':checked')
                        ? 'prefer-not-to-say'
                        : $(display_element).find('#game-stars').attr('data-selected'),
                    fun_rating : $(display_element).find('#fun-stars').attr('data-selected'),
                    hard_rating : $(display_element).find('#hard-stars').attr('data-selected'),
                    clear_rating : $(display_element).find('#clear-stars').attr('data-selected'),
                    bugs : $(display_element).find('input[name="survey-bugs"]:checked').val(),
                    bug_details : $(display_element).find('#bug-details').val(),
                    comments : $(display_element).find('#survey-comments').val(),
                };

                jsPsych.finishTrial(trial_data);
              })
            }
            );
  
      }
    }
    PostSurveyPlugin.info = info;
  
    return PostSurveyPlugin;
  })(jsPsychModule);