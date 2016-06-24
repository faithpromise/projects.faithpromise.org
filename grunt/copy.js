module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('copy', {

        app_templates: {
            expand: true,
            cwd:    app.src_dir + '/js',
            src:    '**/*.html',
            dest:   app.output_dir + '/js'
        },

        app_fontello: {
            expand:  true,
            flatten: false,
            cwd:     app.src_dir,
            src:     'fontello/**/*',
            dest:    app.output_dir
        },

        app_images: {
            expand:  true,
            flatten: false,
            cwd:     app.src_dir,
            src:     'images/**/*',
            dest:    app.output_dir
        },

        app_angular_ui: {
            expand:  true,
            flatten: false,
            cwd:     'bower_components/angular-ui-bootstrap',
            src:     [
                'template/modal/backdrop.html',
                'template/modal/window.html'
            ],
            dest:    'public/uib'
        },

        release_backend: {
            expand: true,
            dest:   '_release',
            cwd:    'backend',
            src:    [
                '**/*',
                '!database/seeds/**/*',
                '!vendor/**/*',
                '!storage/**/*',
                'bootstrap/cache/.gitkeep',
                'storage/.gitkeep'
            ]
        },

        release_frontend: {
            expand: true,
            dest:   '_release/public/build',
            cwd:    'public/build',
            src:    '**/*'
        }

    });

};
