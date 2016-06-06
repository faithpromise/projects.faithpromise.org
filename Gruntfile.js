module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var config = {};

    grunt.option('app', {
        src_dir:    'frontend',
        output_dir: 'public/build',
        js:         {
            src:  [
                'bower_components/angular-elastic/elastic.js',
                'bower_components/angular-ui-bootstrap/src/dropdown/dropdown.js',
                'bower_components/angular-ui-bootstrap/src/position/position.js',
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
