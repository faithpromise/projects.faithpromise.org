module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var config = {};

    grunt.option('app', {
        src_dir:    'frontend',
        output_dir: 'public/build',
        js:         {
            src:  [
                'bower_components/angular-elastic/elastic.js',
                'bower_components/angular-mass-autocomplete/massautocomplete.js',
                'bower_components/angular-PubSub/src/angular-pubsub.js',
                'frontend/js/app.module.js',
                'frontend/js/**/*.js'
            ],
            dest: 'public/build/app.js'
        },
        less:       {
            src:  'frontend/less/app.less',
            dest: 'public/build/app.css'
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Init
    grunt.initConfig(config);

    // Load tasks
    grunt.loadTasks('grunt');

};
