@foreach($comment->project->comments->sortByDesc('created_at') as $c)
{{ $c->sender->abbreviation }}, {{ $c->created_at->format('F j, g:i A') }}

{!! $c->body !!}

----------------------------------------------

@endforeach