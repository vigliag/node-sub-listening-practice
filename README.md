A simple program that relies on mplayer to provide the users an handy way to study a foreign language through subtitled videos. Conceptually similar to Learn With Text and Fleex.

The project is currently in very early stage. Currently it plays a video through mplayer, pausing after each subtitle line, and allowing the user to seek back to the time the line started. Only .ass subtitles are currently supported, but it should be trivial to support more formats.

It consists in a node.js process that communicates with mplayer through a pipe. They are kept in sync through mplayer's slave interface and through the status message it logs to stdout and stderr.

Possible/planned improvement:
* settings to permanently show/hide subs
* a node-webkit interface that allows looking up the current line on a dictionary (a wordreference iframe probably).
* a mean to save the current frame and subtitles, along with the learned words to an anki file, similar to what http://subs2srs.sourceforge.net/ does.