# qtcreeper

About
----

Originally a [fork from the qtcreeper pyhton script](https://github.com/megustalafantabienfria/qtcreeper) where I was supossed to make a port to JS just for fun.

How does it work?
----

This work with a Chromium instance installed by puppeteer, I choosed to use it for two reasons: I wanted to test it and learn a bit about it and I never made work those request libraries with cached cookies and stuff.

I save two files: one for the search configuration and the other one for the users you've already visited.

I load both files, then the menu is prompted and you can configure almost all the stuff.

At the end, you can start creeping people and probably you can find a qt that will love you.

The truth
----
Even though it works... ok, there's some disadvantages regarding the original py script.

- Puppeteer downloads Chromium, like 150mb. Py script only use a just kbs dependency. So, it makes the js script a bit not so fast and portable.
- There's some bugs not completely related to my code but to puppeteer. So, we need to found out how to solve it with a better code.

Bugs and new functionality
----

- Sometimes it takes a lot or even fails while a chromium tab goes directly to a website, I tried to solve it with recursivity but sometimes it also fails.
- Sometimes the script doesn't load the config file right.
- Sometimes it stops to creep, and I don't mean that the script fails. I mean, it still creeping but for interpals, they stop telling to the user that you have visited them.

But now, about functionality.
- I want to add the speedness, but I don't find a way to add it because then the first issue I listed happens.
- I'm thinking about new stuff... but I don't really have something clear
