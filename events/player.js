jcmp.events.Add("PlayerCreated", function(player) {
  player.escapedNametagName = player.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 40);
  player.admin = {};



  if(adminsys.utils.isAdmin(player)) {
    player.admin.rank = 3; // This happens if the player is in array admins
  } else {
    // Fnc to check if is admin on DB

    adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {
      var collection = db.collection('admins');

      collection.find({ steamId: player.client.steamId }).toArray(function(err, result) {
        if(err) {
          //console.error(err);
          db.close();
          return;
        }

        if(result.length === 0) {
          player.admin.rank = 0;
        } else {
          player.admin.rank = result[0].rank;
        }
        db.close();
      });
    });
  }

});

jcmp.events.Add("PlayerReady", function(player) {
  player.escapedNametagName = player.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 40);

  // Call here UI For Admins

  // Check if player is banned

  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {

    var collection = db.collection('banlist');
    collection.find({ steamId: player.client.steamId }).toArray(function(err, result) {
      if(result.length >= 1 && adminsys.config.banonjoin) {
        if(result[0].date_end < Date.now() && result[0].date_end !== 0) {
          collection.deleteOne({ steamId: player.client.steamId }, function(err, result) {
            console.log("Ban for " + player.name + " ended, deleting from banlist collection");
            db.close();
          });
        } else {
          // Kick player

          var banReason = (typeof(result[0].reason) !== 'undefined' ? "<br>Reason: " + result[0].reason : '')
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
          db.close();
        }
      } else {
        if(player.admin.rank >= 1) {
          //console.log("Calling to the adminsys ready event");
          jcmp.events.CallRemote('adminsys_ready', player, JSON.stringify({ name: player.escapedNametagName, networkId: player.networkId, admin: player.admin}))
        }
        db.close();
      }
    });
  });


});
