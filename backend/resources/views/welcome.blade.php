<?php

use App\Helpers\Assets;

?>
<html ng-app="app">

    <head>
        <base href="/">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{--<script src="https://use.typekit.net/gcq3mes.js"></script>--}}
        {{--<script>try {Typekit.load({ async: false });} catch (e) {}</script>--}}

        <title>Projects</title>

        <!-- Libs -->
        <link href="//cdnjs.cloudflare.com/ajax/libs/pikaday/1.4.0/css/pikaday.min.css" rel="stylesheet">
        <link href="<?= Assets::url('build/bootstrap.css') ?>" rel="stylesheet">
        <link href="<?= Assets::url('build/fontello/css/fontello.css') ?>" rel="stylesheet">

        <!-- App -->
        <link href="<?= Assets::url('build/app.css') ?>" rel="stylesheet">
    </head>

    <body ng-controller="main as vm">

        <app-nav ng-if="vm.route_action !== 'login'"></app-nav>
        <app-login ng-if="vm.route_action === 'login'"></app-login>
        <timeline ng-if="vm.route_action === 'home'"></timeline>
        <project-detail ng-if="vm.route_action === 'project'"></project-detail>
        <event-detail ng-if="vm.route_action === 'event'"></event-detail>

        <!-- Libs -->
        <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/pikaday/1.4.0/pikaday.min.js"></script>

        <!-- Angular -->
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular-animate.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.2/angular-resource.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.3/angular-route.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular-moment/1.0.0-beta.5/angular-moment.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/satellizer/0.14.1/satellizer.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/danialfarid-angular-file-upload/12.0.4/ng-file-upload.min.js"></script>
        <!--<script src="//cdnjs.cloudflare.com/ajax/libs/oclazyload/1.0.9/ocLazyLoad.min.js"></script>-->

        <!-- App -->
        <script src="<?= Assets::url('build/app.js') ?>"></script>

    </body>

</html>