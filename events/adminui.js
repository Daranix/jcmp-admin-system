
jcmp.events.AddRemoteCallable('adminsys_server_doAction', function(player, action, data) {

  //console.log(action);

  if(Object.keys(adminsys.actions).indexOf(action) >= 0) {
    // Do action
    //console.log(data);
    //console.log(typeof(data));
    adminsys.actions[action](player, JSON.parse(data)); // FIXME
  } else {

    // Toast with error
    jcmp.events.Call('toast_show', player,  {
        heading: 'Error',
        text: "Was an error trying to execute the action required, action not found",
        icon: 'error',
        loader: true,
        loaderBg: '#9EC600',
        position: 'top-right',
        hideAfter: 5000
    });

  }
});

/*jcmp.events.AddRemoteCallable('adminsys_server_doAction', function(player, action, data) {
  console.log(action);
  jcmp.events.Call(player, action, JSON.parse(data));
});*/

jcmp.events.AddRemoteCallable('adminsys/server/client_request_update_playerList', function(player) {
  var playerList = jcmp.players.map(function(x) {
    return {networkId: x.networkId, name: x.escapedNametagName, adminlevel: x.admin.rank, steamId: x.client.steamId }
  });

  //console.log(playerList);
  jcmp.events.CallRemote('adminsys/client/response_update_playerList', player, JSON.stringify(playerList));
});

jcmp.events.AddRemoteCallable('adminsys/client/req/update_banlist', function(player) {

  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {
    var collection = db.collection('banlist');

    collection.find({}).sort({ date_start: -1 }).limit(35).toArray(function(err, result) {
      if(!err) {
        /*console.log("BanList result:");
        console.log(result);*/

        jcmp.events.CallRemote('adminsys/server/res/update_banlist', player, JSON.stringify(result));
      }
      db.close();
    });
  });

});

/*
jcmp.events.AddRemoteCallable('adminsys/server/request_unban_player', function(player, targetData) {
  adminsys.actions.unbanPlayer(player, targetData);
});
*/

jcmp.events.AddRemoteCallable('adminsys/server/searchBanPlayer', function(player, data) {

  if(player.admin.rank < 1) { // Avoid DDOS
    return;
  }

  var validFilters = ['name', 'steamid'];
  data = JSON.parse(data);
  console.log(data)

  if(validFilters.indexOf(data.filter) === -1) {
    return adminsys.chat.send(player, "Error: invalid search filter");
  }

  if(data.filter === 'steamid') {
    data.filter = 'steamId';
  }

  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {

    var collection = db.collection('banlist');

    var findQuery = {};
    // '' + data.filter + '': new RegExp('^' + data.value, 'i')
    findQuery[data.filter] = new RegExp('^' + data.value, 'i');
    //console.log(findQuery);

    collection.find(findQuery).sort({ date_start: -1 }).limit(35).toArray(function(err, result) { // Limited to 35 more can crash server
      //console.log(result);
      if(!err) {
        jcmp.events.CallRemote('adminsys/server/res/update_banlist', player, JSON.stringify(result));
      }
      db.close();
    });
  });

});

// Spawn things

jcmp.events.AddRemoteCallable('adminsys/server/spawnVehicle', function(player, hash) {

  console.log(hash);

  if(player.admin.rank < 1) {
    // Toast with error
    jcmp.events.Call('toast_show', player,  {
        heading: 'Error',
        text: "You're not allowed to use this command",
        icon: 'error',
        loader: true,
        loaderBg: '#9EC600',
        position: 'top-right',
        hideAfter: 5000
    });
  }

  var vehicle = new Vehicle(hash, player.position, player.rotation);

});
