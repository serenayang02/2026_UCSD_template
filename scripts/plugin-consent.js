var consent = (function (jspsych) {
    "use strict";

    const info = {
        name: "consent",
        parameters: {
        },
    };

    /**
     * ** CONSENT **
     *
     * SHOWS A CONSENT FORM AT THE BEGINNING OF THE TASK
     *
     * @author NATALIA VELEZ｜
     * }
     */
    class ConsentPlugin {
        constructor(jsPsych) {

            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {
            // set up page
            $(display_element).load('templates/consent.html', function () {

                $(display_element).addClass('consent');

                // Key elements in consent form
                var checkbox = $(display_element).find('input[type="checkbox"]');
                var cont_btn = $(display_element).find('button');

                // Activate button when checkbox is ticked
                $(display_element).find('input[type="checkbox"]').on('click', function () {
                    if (this.checked) {
                        cont_btn.prop('disabled', false);
                        cont_btn.one('click', function () {

                            // Save data
                            var trial_data = {
                                consent: checkbox.prop('checked')
                            };

                            // End trial
                            $(display_element).removeClass('consent');
                            console.log('Advancing trial');
                            jsPsych.finishTrial(trial_data);

                        });

                    } else {
                        // Disable if participant unchecks
                        cont_btn.unbind('click');
                        cont_btn.prop('disabled', true);

                    }
                });

            });
        }
    }

    ConsentPlugin.info = info;

    return ConsentPlugin;
})(jsPsychModule);