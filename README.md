# reveal-sync &mdash; Synchronizing distributed Reveal.js presentations

### tl;dr

One person loads a Reveal.js presentation, creates a unique stream ID and
shares a link with the other participants. The participants load the presentation using
the unique ID and are automatically subscribed to "navigation" events from the presenter &mdash;
next slide, prev slide, next fragment, etc.

### Longer version...

Not too long ago I gave a presentation on
<a href="http://jlabusch.github.io/distributed-teams">working with distributed teams</a>.
Ironically, some members of the audience were joining remotely and for various boring
reasons we couldn't share the slides over a video conferencing link. I shared a link
to the hosted slides so they could follow along, but keeping everyone on the same page
was an annoying distraction.

And so `reveal-sync` was born. "But surely," you say, "this must be a solved problem! Why re-invent
the wheel?!"

Well, sometimes you just need your own wheel.

`reveal-sync` is

* Designed to work with <a href="https://github.com/hakimel/reveal.js">Reveal.js</a> presentations
* Very easy to use
* Available as a free service using `sync.downlink.nz`
* Open source (GPLv3)

`reveal-sync` does require that the presentation be hosted in a place that all
participants have access to, e.g. <a href="http://github.io">GitHub.io</a>.

### How to use the free hosted service

<b>Note: Service down over new year, back in January.</b>

Include the following in your presentation:

```diff
  <script src="lib/js/head.min.js"></script>
  <script src="js/reveal.js"></script>
+ <script src="http://downlink.nz/js/socket.io.js"></script>
+ <script src="http://downlink.nz/js/reveal-sync.js"></script>

  <script>
```

That's it! Next time you refresh your presentation you'll get a prompt with a copy-able link
like this

> http://example.com/presentation/?sync=8041e93e-0df8-4fe4-8d7d-eab26adeadfa

Share that with your team and they'll be automatically subscribed to your Reveal.js navigation events.

### Hosting your own service

Take a look at the `ansible` playbook in the repository. If you're using Nginx, Varnish or similar,
remember that you need to support websockets and HTTP 1.1.

In your presentation, specify your `reveal-sync` server's URI as follows:

```diff
  <script src="lib/js/head.min.js"></script>
  <script src="js/reveal.js"></script>
  <script src="http://downlink.nz/js/socket.io.js"></script>
+ <script>
+   var reveal_sync_uri = 'http://example.com/';
+ </script>
  <script src="http://downlink.nz/js/reveal-sync.js"></script>
```

### License

Copyright (C) 2015 Jacques Labuschagne

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
