#friendsonly
A media site for your friends only.

##Who is this for?
Well, me mostly. But you might also find this useful if you want to make videos generally available to people you know. And how else determine if you know someone than by checking your friends on Facebook?

##What does it do?
The site served by this code will only show content to people you are friends with on Facebook.

Every request to the site is checked for a cookie. Requests for media will simply get a 403 Forbidden if the cookie is missing. Requests for pages like / or /video/<slug> will redirect the user to Facebook where permission must be granted for the site to inspect the users' friends list (this friends list contains only the users' friends also using this site's Facebook app). After returning to the site, we check to see if the user is friends with the site owner. If so, the cookie is served and the user may proceed. If not, they are out of luck.

If the user is friends with the site owner, media is proxied from S3.

##How does it work?
It's an Express app. The most significant code happens in the handlers/ subdirectory. You can see how we are checking to see if the user is friends with the site owner in the handlers/oauth.js file.

The site was designed specifically to serve up HTML5 video. To that end, there is also a ffmpeg encoding script in the project root: encode_all.sh. This script takes the name of video as a parameter and produces three h.264/mp4 and three vp8/webm videos of different sizes.

There is a simple client-side script that changes the active source video based on the longest axis of the window (so the best video is always selected for landscape orientation).

##Can I install it?
Yes. Clone the repo. `npm install`. For local development you can just run `gulp serve`.

You will need to fill in the blanks in config.json and media.json (copy the -sample versions of those files).

The field names in config.json should be self-explanatory except for `secret`. `secret` should just be a random string that Express can use to sign cookies.

If you have files in your S3 bucket like this:

* /Videos/My\_Sample\_Video/my\_sample\_video-480.mp4
* /Videos/My\_Sample\_Video/my\_sample\_video-480.webm
* /Videos/My\_Sample\_Video/my\_sample\_video.jpg


One of the blocks in media.json should look something like this:

```
[{
  "slug": "my-sample-video",
  "name": "My Sample Video",
  "video": "/Videos/My_Sample_Video/my_sample_video",
  "thumbnail": "/Videos/My_Sample_Video/my_sample_video.jpg"
}
```
