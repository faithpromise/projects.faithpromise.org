<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model {

    public $fillable = ['comment_id', 'name', 'mime_type'];
    public $appends = ['has_thumb', 'thumb_url', 'download_url'];

    public function recipients() {
        return $this->belongsTo(Comment::class);
    }

    public function getExtensionAttribute() {
        $path_info = pathinfo($this->name);

        return $path_info['extension'];
    }

    public function getFileNameAttribute() {
        return $this->id . '-' . $this->name;
    }

    public function getThumbUrlAttribute() {
        if ($this->has_thumb) {
            return '/api/attachments/' . $this->id . '/thumb.' . $this->extension;
        }

        return '/build/images/document.png';
    }

    public function getDownloadUrlAttribute() {
        return '/api/attachments/' . $this->id . '/file.' . $this->extension;
    }

    public function getHasThumbAttribute() {
        return in_array(strtolower($this->extension), ['png', 'jpg', 'jpeg', 'gif']);
    }

    public function getPathAttribute() {
        return storage_path('attachments/' . $this->file_name);
    }

    public function setCommentId($param) {
        $this->{'comment_id'} = $param;

        return $this;
    }

    public function setName($param) {
        $this->{'name'} = $param;

        return $this;
    }

//    public function getMimeTypeAttribute() {
//
//        $ext = $this->extension;
//        $types = [
//            'gif'  => 'image/gif',
//            'jpg'  => 'image/jpeg',
//            'jpeg' => 'image/jpeg',
//            'png'  => 'image/png',
//            'pdf'  => 'application/pdf'
//        ];
//
//        if (array_key_exists($ext, $types)) {
//            return $types[$ext];
//        }
//
//        return 'application/unknown';
//    }

}
