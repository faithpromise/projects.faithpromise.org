<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Comment;
use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class AttachmentsController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {

        $attachments = Attachment::where('comment_id', '=', $request->input('comment_id'))->get();

        return [
            'data' => $attachments
        ];
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {

        /** @var \Symfony\Component\HttpFoundation\File\File $file */
        foreach ($request->file('file') as $file) {

            $comment = Comment::find($request->input('comment_id'));

            $screenshot_index = $comment->attachments()->where('name', 'like', 'screenshot%')->count() + 1;
            $screenshot_name = $screenshot_index > 1 ? 'screenshot-' . $screenshot_index : 'screenshot';

            $path_info = pathinfo($file->getClientOriginalName());
            $filename = $path_info['filename'] === 'blob' ? $screenshot_name : $path_info['filename'];
            $extension = $file->guessExtension() ?: 'unknown';

            $attachment = new Attachment();
            $attachment->setCommentId($comment->id);
            $attachment->setName(str_slug($filename) . '.' . $extension);
            $attachment->save();

            $file->move(storage_path('attachments'), $attachment->file_name);
        }

    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {

        $attachment = Attachment::find($id);
        unlink($attachment->path);
        $attachment->delete();
    }

    public function thumb($id) {
        $attachment = Attachment::find($id);

        if ($attachment->has_thumb) {

            $img = Image::make($attachment->path)->fit(200, 200);

            return $img->response('jpg');
        }

        // TODO: What to return?
    }

    public function download($id) {

        $attachment = Attachment::find($id);

        $file = File::get($attachment->path);
        $mime_type = File::mimeType($attachment->path);

        $response = Response::make($file, 200);
        $response->header('Content-Type', $mime_type);
        $response->header('Content-Disposition', 'inline; filename="' . $attachment->name . '"');

        return $response;
    }
}
