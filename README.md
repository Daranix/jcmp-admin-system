# Just Cause 3 nanos Multiplayer Admin tools

### ATTENTION: This plugin requires the use of [Just Cause 3 Toast package](https://github.com/Daranix/jcmp-toast)
### REPORT ISSUES HERE: [ISSUES](https://github.com/Daranix/jcmp-admin-system/issues)

#### Info about the package:

* [Features](#pkgfeatures)
* [Configuration](#pkgconfig)
* [List of commands](#listcmd)
* [License](https://github.com/Daranix/jcmp-admin-system)
* [Debug commands](https://github.com/Daranix/jcmp-projects-debug-commands/tree/master/adminsys)

#### Features

* Kick a player
* Ban a player permanent or by time
* Give weapons to players with spawn menu
* Spawn vehicles
* Set health of a player
* List of banned players
* Complete admin panel inside the game for all of this features

##### You can check all this features from this video:

Coming soon

#### Configuration

1. Install the required dependencies with `npm install` on the package folder
2. Install mongo db
3. Configure the `config.js` file inside the package folder

#### List of commands

| Command | Description |
| --- | --- |
| /amenu | *Open the admin menu* |
| /aban | *Bans a player* |
| /akick | *Kick a player from the server* |
| /asetrank | *Set the admin rank of a player* |
| /aoe, /abroadcast, /ab | *Broadcast a message to all players with [ADMIN] tag* |
| /a, /asay | *Send a message to the admin chat* |
| /nid | *Show the network Id of a player* |
