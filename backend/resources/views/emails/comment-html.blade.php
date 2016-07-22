<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>{{ $subject }}</title>
        <style>
            table td {
                border-collapse: collapse;
            }
        </style>
    </head>
    <body>
        <table style="width: 100%;">
            <tbody>
                <tr>
                    <td style="padding:20px;">
                        <table style="width: 100%;">
                            <tbody>
                                @foreach($comment->project->comments->sortByDesc('created_at') as $c)
                                    <tr class="Comment">
                                        <td>
                                            <table class="Comment-header" style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td style="width: 50px;">
                                                            <img src="{{ $c->sender->avatar_url }}" width="40" height="40" style="border-radius: 4px;">
                                                        </td>
                                                        <td style="vertical-align: top;">
                                                            <p style="margin-bottom: 3px; margin-top: 0px; font-family:'Lucida Grande', 'Lucida Sans Unicode', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold;">{{ $c->sender->name }}</p>
                                                            <span style="font-family:'Lucida Grande', 'Lucida Sans Unicode', Helvetica, Arial, sans-serif; font-size: 14px; color:#777777;">{{ $c->created_at->format('F j, g:i A') }}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td style="width: 50px;"><p>&nbsp;</p></td>
                                                        <td style="font-family:'Lucida Sans Unicode', 'Lucida Grande', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color:#222222;">
                                                            {!! $c->body !!}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td><p style="border-top:1px dotted #c5c5c5;">&nbsp;</p></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>

    </body>
</html>