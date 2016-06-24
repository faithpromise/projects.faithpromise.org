module.exports = function (grunt) {

    var app     = grunt.option('app');
    var blaze   = grunt.option('blaze');
    var website = grunt.option('website');

    grunt.config('html2js', {

        options: {
            base:   '',
            rename: function (moduleName) {
                moduleName = moduleName.replace('frontend-website', '/build/website');
                moduleName = moduleName.replace('bower_components/angular-ui-bootstrap', 'uib');
                return moduleName;
            }
        },

        // app: {
        //     src:    [
        //         'frontend/js/search/search-form.html'
        //     ],
        //     dest:   website.output_dir + '/templates.js',
        //     module: 'template-cache'
        // }

    });

};