# Retro MP3 Player

Have you ever thought to yourself "Gosh damn my music taste so peak, so niche!" but you're too damn shy to play it out loud on your computer? 
**BUT** you still want people to see what you are listening?
Well, what I have here is a retro-styled MP3 player for Windows, built with Electron. It plays the songs already in your Music folder. 
No setup, no account, and no internet connection needed. It sits on top of your current windows, so it acts like a widget, 
displaying your songs with style and class. It's a good conversation starter, very convenient too to be honest, just drag it to the side
so it won't get in the way with your workflow, and don't like the current song? just skip it from the side. No need for reopening and 
closing your old default media player.

   ![Retro MP3 Player screenshot](screenshot(297).png)
   ![Retro MP3 Player screenshot](screenshot(298).png)

## Download

Get the latest version from the [Releases page](../../releases).

- **Setup.exe**: installer (recommended)
- **Portable .exe**: runs without installing

Windows may show "Windows protected your PC" the first time, because the app isn't code-signed. Click **More info**, then **Run anyway**.

## Features

- Plays every `.mp3` in your Music folder, including subfolders
- Play/pause, next/previous, skip back/forward 10 seconds, volume up/down
- Scrolling song title and progress bar on the LCD screen
- Two themes: double-click the screen to switch between Classic and Wine

## Usage

1. Put your MP3 files in your Windows Music folder.
2. Open the app. It starts playing automatically.
3. Use the pad buttons to control playback/pause/play.
4. The thin buttons above the screen are for skipping 10s back/forwards.

## Limitations

- Windows only
- Only `.mp3` files are supported

## Run from source

Requires [Node.js](https://nodejs.org).

```
git clone https://github.com/rodriguezjafet339-create/Retro-mp3-player.git
cd mp3-player
npm install
npm start
```

## Build the installer

```
npm run dist
```

The installer and portable `.exe` are created in the `dist/` folder. Build on Windows.

## License

ISC
