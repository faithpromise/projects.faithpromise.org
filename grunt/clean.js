module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('clean', {

        build:   ['public/build/*', '!public/build/.gitkeep'],
        release: ['_release/*', '!_release/.gitkeep']

    });

};
