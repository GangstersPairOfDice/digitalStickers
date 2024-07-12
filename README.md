# digitalStickers

<p align="center">
  <img src="images/icons/digitalstickers.png" alt="digitalStickers logo" height="200" width="200" />
</p>

digitalStickers places digital stickers on your screen. Digital stickers could be images, videos, or whatever you want it to be. Currently a working proof-of-concept.

Features
---
 - Places a preset sticker on your screen
 - You can move this sticker by dragging it
 - The sticker is always on top of everything on the screen by design

Building
---
Have not tested myself yet, but you should be able to clone this repo, cd into into the repos directory, then run

```
yarn
yarn start
```

`yarn` will automatically install any dependancies, and `yarn start` will run the application

This way you can customize the sticker which appears, by editing `index.html`

In `main.js` you can toggle some experimental features, like having stickers appear even in fullscreen mode. To enable this, uncomment the `type: panel` option under the BrowserWindows creation. Here you can also remove the shadows from the sticker, etc.

Planned Features
---
 - [ ] Adding your own sticker easily
 - [ ] Multiple stickers at once
 - [ ] Sticker book for collections of stickers
 - [ ] Options menu for sticker placement preferences

Technologies Used
---
Electron, Chromium, NodeJS, Javascript, HTML, CSS
