<p align="center">
    <img src="./Resound/Assets/img/resound.png" alt="Resound logo" width="128" height="128">
</p>

# Resound - Remote music library

Play your local music file remotely !

Resound is a web music-player that can be used to play your local 
music files from everywhere as long as you have a web browser

## Purpose / Goal

Having your MP3s on a disk is an easy thing to manage, managing them between your PC, phone, and other devices is really something else

The purpose of Resound is to store all of your files on one device, and use this Resound to play them on any device !

## Features

- Full library discovery
- Metadata parsing (Artist, Album, Cover...)
- Music gallery + Shuffle
- Favorite track management
- Listening statistics
- MediaSession support (Play/Pause, Next, Previous...)
- Customizable actions on previous/next buttons

<p align="center">
    <img src="./Resound/Assets/img/resound-preview.jpg" alt="Resound User Interface Preview" width="512">
</p>


## Requirements

- Internet connection
- PHP 8 (With SQLite Driver)
- FTP Server on Library device*

(*If the music is not hosted on the same device as Resound)

## Installation

First, clone the application and make an empty configuration

```bash
git clone https://github.com/yonis-savary/resound.git --recursive

cd resound

# Create the database, a user and configure the library
./install.sh
```

Then, you can either connect to your server through a HTTP Server like Apache, or launch `php do serve` to launch PHP's built-in server

When connected to Re-Sound:
- go to the 'Settings' page (top-right corner of the window)
- click the `'Discover new tracks'` button

## More

### Advanced Bluetooth/Hands-Free control

If your audio device has controls with the 'skip' and 'previous' buttons :
- Press 'previous' two times quickly to shuffle through your entire library
- Press 'skip' two times quickly to enable mood-mode !

Also, you can choose with button launch what action in the 'settings' menu

### CRON

You can add a [CRON](https://en.wikipedia.org/wiki/Cron) job to discover new files instead of clicking `'Discover new tracks'` button every time music is added to your library

```cron
0 * * * * cd /dir/to/resound && php do discover-new-files
```

This way, a process to discover new files is launched every hour