<?php

namespace App\Helpers;

class Assets {

    static public function url($url) {

        // Make sure we have a leading slash
        $url = '/' . trim($url, '/');

        return $url . '?v=' . md5(file_get_contents('.' . $url));
    }

}
