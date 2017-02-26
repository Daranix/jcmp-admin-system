var Action = module.exports;
var errMsg = require('./message_errors.js');

/// -------------------  BAN PLAYER  ---------------------------- ///

Action.banPlayer = function(player, data) {

    //console.log("Banning player ")
    //console.log(data);

    if (player.admin.rank < 1) {
      errMsg.NO_PERMISSION(player);
      return;
    }

    const res = adminsys.utils.getPlayer(data.target.networkId.toString());
    if (res.length === 0) {
      errMsg.NO_PLAYER(player);
      return;
    }

    if(res.length >= 2) {
      errMsg.MORE_THAN_ONE(player);
      return;
    }

    var target = res[0];

    // Add player to ban list

    if(isNaN(data.time)) {
      jcmp.events.Call('toast_show', player, {
          heading: 'Error',
          text: 'Time or time type are not numbers',
          icon: 'error',
          loader: true,
          loaderBg: '#9EC600',
          position: 'top-right',
          hideAfter: 3000
      });
      return;
    }

    if(typeof(data.timeType) === 'undefined') {
      data.timeType = 'minutes';
    }

    var time = parseInt(data.time);
    if(time >= 1) {
      var banEndMs;
      switch (data.timeType) {
        case 'seconds':
          banEndMs = adminsys.utils.secondsToMs(time);
          break;
        case 'minutes':
          banEndMs = adminsys.utils.minutesToMs(time);
          break;
        case 'hours':
          banEndMs = adminsys.utils.hoursToMs(time);
          break;
        case 'days':
          banEndMs = adminsys.utils.daysToMs(time);
          break;
        default:
          jcmp.events.Call('toast_show', player, {
              heading: 'Error',
              text: 'Time type not valid',
              icon: 'error',
              loader: true,
              loaderBg: '#9EC600',
              position: 'top-right',
              hideAfter: 3000
          });
          return;
          break;
      } // End switch
      time = Date.now() + banEndMs;
    } else {
      time = 0;
    }


    var banData = {
      name: target.name, // FIXME maybe need to escape the nametag!
      steamId: target.client.steamId,
      reason: data.reason,
      bannedby: {
        name: player.escapedNametagName,
        steamId: player.client.steamId
      },
      date_start: Date.now(),
      date_end: time
    };

    //console.log("Ban Data:");
    //console.log(banData);

    adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {

      // If is admin delete from admin list

      if(player.admin.rank >= 1) {
        var admcollection = db.collection('admins');
        admcollection.deleteOne({ steamId: target.client.steamId}, function(err, result) {
          db.close();
        });
      }

      var collection = db.collection('banlist');
      // Insert ban
      collection.insertOne(banData, function(err, result) {
        var banTime;

        if(parseInt(data.time) === 0) {
          banTime = 'permanent';
        } else {
          banTime = data.time + " " + data.timeType;
        }

        var banText = `${player.escapedNametagName} banned ${target.escapedNametagName}. ` + banTime + " " + (data.reason.length > 0 ? `Reason: ${data.reason}` : '');

        var banToastText = `<b>${player.escapedNametagName}<b> banned you ${banTime} <br>` + (data.reason.length > 0 ? `REASON: ${data.reason}` : '');

        jcmp.events.Call('toast_show', target, {
            heading: 'Banned',
            text:  banToastText,
            icon: 'error',
            loader: true,
            loaderBg: '#9EC600',
            position: 'mid-center',
            hideAfter: 4500
        });

        adminsys.chat.broadcast(banText, adminsys.config.colours.orange);
        adminsys.workarounds.watchPlayer(target, setTimeout(() => target.Kick(data.reason), 5000));
        console.log(banText);
        db.close();
      });
    });

} // End of ban player action

/// -------------------  KICK PLAYER  ---------------------------- //

Action.kickPlayer = function(player, data) {

  if (player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  const res = adminsys.utils.getPlayer(data.target.networkId.toString());
  if (res.length === 0) {
    errMsg.NO_PLAYER(player);
    return;
  }

  if(res.length >= 2) {
    errMsg.MORE_THAN_ONE(player);
    return;
  }

  var target = res[0];

  adminsys.chat.broadcast(`${player.escapedNametagName} kicked ${target.escapedNametagName}.` + (data.reason.length > 0 ? ` Reason: ${data.reason}` : ''), adminsys.config.colours.orange);
  adminsys.workarounds.watchPlayer(target, setTimeout(() => target.Kick(data.reason), 5000));

} // End of kick player action

// ----- SET ADMIN RANK ----- //

Action.setAdminRank = function(player, data) {

  if(player.admin.rank < 3) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  const res = adminsys.utils.getPlayer(data.target.networkId.toString());

  if(res.length === 0) {
    errMsg.NO_PLAYER(player);
    return;
  }

  if(res.length >= 2) {
    errMsg.MORE_THAN_ONE(player);
    return;
  }

  if(isNaN(data.rank)) {
    jcmp.events.Call('toast_show', player, {
        heading: 'Error',
        text: 'The rank should be a number',
        icon: 'error',
        loader: true,
        loaderBg: '#9EC600',
        position: 'top-right',
        hideAfter: 3000
    });
    return;
  }


  var target = res[0];

  if(target.admin.rank === data.rank) {
    jcmp.events.Call('toast_show', player, {
        heading: 'Error',
        text: 'You already have that rank!',
        icon: 'error',
        loader: true,
        loaderBg: '#9EC600',
        position: 'top-right',
        hideAfter: 3000
    });
    return;
  }

  // Insert new Admin

  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {

    // Get the documents collection
    var collection = db.collection('admins');
    // Insert some documents

    collection.find({ steamId: target.client.steamId }).toArray(function(err, result) {

      if(err) {
        console.error(err);
        db.close();
        return;
      }

      if(result.length == 0) {
        // Insert admin
        if(data.rank >= 1) {
          collection.insertOne({ name: target.name, rank: data.rank, steamId: target.client.steamId }, function(err, result) {
            console.log("Added admin to the database")
            db.close();
          });
        }
      } else {
        if(data.rank === 0) {
          // Delete from admin table
          collection.deleteOne({ steamId: target.client.steamId}, function(err, result) {
            console.log("Deleted admin from table");
            db.close();
          });
        } else {
          // Update from admin table
          collection.updateOne({ steamId: target.client.steamId }, { $set: { rank: data.rank }}, function(err, result) {
            console.log("Updated admin rank!");
            db.close();
          });
        }
      }

      target.admin.rank = data.rank;

      db.close();

    });
  });
}

// --- TP PLAYER --- //
Action.tpPlayer = function(player, data) {

  if(player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  const res = adminsys.utils.getPlayer(data.target.networkId.toString());

  if(res.length === 0) {
    errMsg.NO_PLAYER(player);
    return;
  }

  if(res.length >= 2) {
    errMsg.MORE_THAN_ONE(player);
    return;
  }

  var target = res[0];

  if(data.here) {
    adminsys.chat.send(target, "You have been teleported by an admin");
    target.position = player.position;
  } else {
    adminsys.chat.send(player, `You have been teleported to ${target.escapedNametagName}`);
    player.position = target.position;
  }

};

Action.setHP = function(player, data) {

  if(player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  const res = adminsys.utils.getPlayer(data.target.networkId.toString());

  if(res.length === 0) {
    errMsg.NO_PLAYER(player);
    return;
  }

  if(res.length >= 2) {
    errMsg.MORE_THAN_ONE(player);
    return;
  }

  var target = res[0];

  target.health = data.hp;

  jcmp.events.Call('toast_show', target, {
      heading: 'Action completed',
      text: `${target.escapedNametagName} HP is now ${target.health}`,
      icon: 'success',
      loader: true,
      loaderBg: '#9EC600',
      position: 'top-right',
      hideAfter: 3000
  });

}

Action.unbanPlayer = function(player, targetData) {

  if(player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  // Try to find the player, and unban it

  /*
  var target = JSON.parse(targetData);
  console.log(target);*/

  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {

    var collection = db.collection('banlist');

    collection.deleteOne({ steamId: targetData.steamId.toString() }, function(err, result) { // Limited to 35 more can crash server
      //console.log(result);
      if(!err) {
        //jcmp.events.CallRemote('adminsys/server/res/update_banlist', player, JSON.stringify(result));
        console.log(result.result.n);
        // FIXME Add msg to cnfirm the ban
      }
      db.close();
    });
  });


}

Action.spawnVehicle = function(player, hash) {

  if(player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  var vehPos = new Vector3f(player.position.x + 300, player.position.y, player.position.z);
  const vehicle = new Vehicle(hash, vehPos, player.rotation);

}

Action.spawnWeapon = function(player, data) {

  if(player.admin.rank < 1) {
    errMsg.NO_PERMISSION(player);
    return;
  }

  //data = JSON.parse(data);
  //console.log(data);
  var res = adminsys.utils.getPlayer(data.target.networkId.toString());
  //console.log(res);
  if(res.length < 1) {
    errMsg.NO_PLAYER(player);
    return;
  }

  if(res.length >= 2) {
    errMsg.MORE_THAN_ONE(player)
    return;
  }

  var target = res[0];
  target.GiveWeapon(data.hash, data.ammo, true);

}
