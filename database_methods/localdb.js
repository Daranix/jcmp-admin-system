'use strict';

// NOTE: This uses the total.js Database API
// DOCS: https://docs.totaljs.com/latest/en.html#api~Database
// Also check: https://github.com/petersirka/nosql

var ldbMethods = class Mongo {

    static databaseConnection() {
        console.log("[AdminSYS] Using localDB");
        this.nosql = require('nosql');
        this.db = {
            admins: this.nosql.load(__dirname + '/../localDB/admins.nosql'),
            banlist: this.nosql.load(__dirname + '/../localDB/banlist.nosql')
        }
    }

    static PlayerReady(player) {

        var self = this;

        this.db.banlist.find().make(function(builder) {
            builder.where('steamId', player.client.steamId);
            builder.callback(function(err, result) {

                if(err) {
                    console.log(err);
                }

                console.log(result.length);
                console.log()

                if (result.length >= 1 && adminsys.config.banonjoin) {
                    if (result[0].date_end < Date.now() && result[0].date_end !== 0) {
                        self.db.banlist.remove().make(function(builder) {
                            builder.where('steamId', player.client.steamId);
                            builder.callback(function(err, count) {
                                console.log("Ban for " + player.name + " ended, deleting from banlist collection");
                            });
                        });

                    } else {
                        // Kick player

                        var banReason = (typeof (result[0].reason) !== 'undefined' ? "<br>Reason: " + result[0].reason : '')
                        adminsys.chat.send(player, "You are banned until: " + (result[0].date_end >= 1 ? new Date(result[0].date_end) : 'Permanent'));

                        var toastData = {
                            heading: "You're banned",
                            text: "You are banned until: <br>" + (result[0].date_end >= 1 ? new Date(result[0].date_end) : 'Permanent') + "<br><br>" + banReason,
                            icon: 'error',
                            showHideTransition: 'slide',
                            position: 'mid-center',
                            hideAfter: 4500
                        };

                        //console.log(toastData);
                        jcmp.events.Call('toast_show', player, toastData);
                        adminsys.workarounds.watchPlayer(player, setTimeout(() => player.Kick(banReason), 5000));
                    }

                } else {

                    if (player.admin.rank >= 1) {
                        //console.log("Calling to the adminsys ready event");
                        jcmp.events.CallRemote('adminsys_ready', player, JSON.stringify({
                            name: player.escapedNametagName,
                            networkId: player.networkId,
                            admin: player.admin
                        }))
                    }
                }
            });
        })

    }

    static PlayerCreated(player) {

        this.db.admins.find().make(function(builder) {
            builder.where('steamid', player.client.steamId);
            builder.callback(function(err, result) {
                if (err) {
                    return console.log(err);
                }

                if (result.length === 0) {
                    player.admin.rank = 0;
                } else {
                    player.admin.rank = result[0].rank;
                }
            })
        })
    }

    static updateBanlist(player) {

        this.db.banlist.find().make(function(builder) {
            builder.sort('date_start');
            builder.take(35);
            builder.callback(function(err, result) {
                if(!err) {
                    jcmp.events.CallRemote('adminsys/server/res/update_banlist', player, JSON.stringify(result));
                }
            });
        });

    }

    static searchBanPlayer(player, data) {

        // TODO: Maybe check if is a valid filter

        this.db.banlist.find().make(function(builder) {
            builder.search(data.filter, data.value, 'beg');
            builder.sort('date_start');
            builder.take(35);
            builder.callback(function(err, result) {
                if(!err) {
                    jcmp.events.CallRemote('adminsys/server/res/update_banlist', player, JSON.stringify(result));
                }
            });

        });

    }

}

ldbMethods.actions = class Actions {

    static banPlayer(player, target, data, banData) {

        if(target.admin.rank >= 1) {
            ldbMethods.db.admins.remove().make(function(builder) {
                builder.where('steamId', target.client.steamId);
                builder.callback(function(err, count) {
                    if(err) console.log(err);
                });
            });
        }

        ldbMethods.db.banlist.insert(banData).callback(function(err) {

            if(err) {
                console.log(err);
                return;
            }
            var banTime;

            if (parseInt(data.time) === 0) {
                banTime = 'permanent';
            } else {
                banTime = data.time + " " + data.timeType;
            }

            var banText = `${player.escapedNametagName} banned ${target.escapedNametagName}. ` + banTime + " " + (data.reason.length > 0 ? `Reason: ${data.reason}` : '');

            var banToastText = `<b>${player.escapedNametagName}<b> banned you ${banTime} <br>` + (data.reason.length > 0 ? `REASON: ${data.reason}` : '');

            jcmp.events.Call('toast_show', target, {
                heading: 'Banned',
                text: banToastText,
                icon: 'error',
                loader: true,
                loaderBg: '#9EC600',
                position: 'mid-center',
                hideAfter: 4500
            });

            adminsys.chat.broadcast(banText, adminsys.config.colours.orange);
            adminsys.workarounds.watchPlayer(target, setTimeout(() => target.Kick(data.reason), 5000));
            console.log(banText);
        });

    }

    static setAdminRank(target, data) {

        ldbMethods.db.admins.find().make(function(builder) {
            builder.where('steamId', target.client.steamId);
            builder.callback(function(err, result) {

                if(err) {
                    console.log(err);
                    return;
                }

                if(result.length == 0) 
                {
                    if(data.rank >= 1) 
                    {
                        ldbMethods.db.admins.insert({
                            name: target.name,
                            rank: data.rank,
                            steamId: target.client.steamId
                        }).callback(function(err) {
                            console.log("Added admin to the database");
                        });
                    }
                } else {
                    if(data.rank === 0) {

                        ldbMethods.db.admins.remove().make(function(builder) {
                            builder.where('steamId', target.client.steamId);
                            builder.callback(function(err) {
                                if(!err) {
                                    console.log("Deleted admin from table");
                                } else {
                                    console.log(err);
                                }
                            })
                        });

                    } else {
                        ldbMethods.db.admins.modify({
                            steamId: target.client.steamId
                        }).make(function(builder) {
                            builder.where('steamId', target.client.steamId);
                            builder.callback(function(err, count) {
                                if(!err) {
                                    console.log("Updated admin rank for " + count);
                                } else {
                                    console.log(err);
                                }
                            })
                        });
                    }
                }
            });
        });

        target.admin.rank = data.rank;

    }

    static unbanPlayer(targetData) {

        ldbMethods.db.banlist.remove().make(function(builder) {
            builder.where('steamId', targetData.steamId.toString());
            builder.callback(function(err, count) {
                if(!err) {
                    console.log("Unnbaned " + count + " player");
                }
            });
        });

    }

}

module.exports = ldbMethods;