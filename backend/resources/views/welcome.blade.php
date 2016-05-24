<?php

use App\Helpers\Assets;

?><html>
    <html ng-app="app">

        <head>
            <base href="/">
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">

            {{--<script src="https://use.typekit.net/gcq3mes.js"></script>--}}
            {{--<script>try {Typekit.load({ async: false });} catch (e) {}</script>--}}

            <title>Projects</title>

            <link href="<?= Assets::url('build/app.css') ?>" rel="stylesheet">
            <link href="<?= Assets::url('build/fontello/css/fontello.css') ?>" rel="stylesheet">
        </head>

        <body ng-controller="main as vm">

            <app-nav></app-nav>

            <timeline ng-if="vm.route_action === 'home'"></timeline>

            <div class="" ng-if="vm.route_action === 'project'">
                Project details
                <p><a href="/">Timeline</a></p>
            </div>

            <div class="" ng-if="vm.route_action === 'event'">
                Event Details
                <p><a href="/">Timeline</a></p>
            </div>

            <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular-animate.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular-resource.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.3/angular-route.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/angular-moment/1.0.0-beta.5/angular-moment.min.js"></script>
            {{--<script src="//cdnjs.cloudflare.com/ajax/libs/oclazyload/1.0.9/ocLazyLoad.min.js"></script>--}}

            <script src="<?= Assets::url('build/app.js') ?>"></script>

        </body>

    </html>