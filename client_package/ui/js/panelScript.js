

/*
  FOR DEBUG
*/

/*
var jcmp = {};
jcmp.AddEvent = function(string, callback) {};
jcmp.CallEvent = function(string, callback) {};*/



// Directive for load javascript from included

(function (ng) {
  'use strict';

  var app = ng.module('ngLoadScript', []);

  app.directive('script', function() {
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr)
      {
        if (attr.type==='text/javascript-lazy')
        {
          var s = document.createElement("script");
          s.type = "text/javascript";
          var src = elem.attr('src');
          if(src!==undefined)
          {
              s.src = src;
          }
          else
          {
              var code = elem.text();
              s.text = code;
          }
          document.head.appendChild(s);
          elem.remove();
        }
      }
    };
  });

}(angular));

// General panel control with angular

var app = angular.module("AdminPanel", ['ngLoadScript']);

/*
app.directive('script', function() {
  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elem, attr) {
      if (attr.type=='text/javascript-inc') {
        var code = elem.text();
        var f = new Function(code);
        f();
      }
    }
  };
});*/

app.service("adminPanelService", function($rootScope) {

  var adm = {};

  //adm.playerActions

  adm.generatePlayers = function() {
    var players = [];

    for(var i = 1; i <= 30; i++) {
      players.push({ name: 'Player' + i, networkId: i, date_start: 1288323623006, date_end: 1288323623006, steamId: 24930820943});
    }
    return players;
  }

  adm.localPlayer = {};

  adm.players = [];
  adm.selectedPlayer = {};
  adm.banList = [];

  // Update the player list
  jcmp.AddEvent('adminsys/ui/response_update_playerList', function(String_playerList) {
    console.log('Update player list');
    //console.log(String_playerList);

    adm.players = JSON.parse(String_playerList);
    if(typeof(adm.selectedPlayer.networkId) === 'undefined') {
      adm.selectedPlayer = adm.players[0];
    }
    $rootScope.$apply();
  });

  // Update himself info
  jcmp.AddEvent('adminsys/ui/updateInfo/localPlayer', function(pLocalData) {

    console.log('Update local player info');
    //console.log(pLocalData);
    adm.localPlayer = JSON.parse(pLocalData);
    $rootScope.$apply();
  });

  return adm;

});
/*
app.service("banService", function() {

  jcmp.AddEvent('adminsys/ui/update/banList', function(banList) {
    var bans = JSON.parse(banList);
    console.log("Update ban list");
    console.log(bans);
  });


});
*/
app.controller("actions", ['$scope', 'adminPanelService', function($scope, adminPanelService) {

  $scope.adm = adminPanelService; // This shit changes ^^

  $scope.footerOptions = [
    { name: "Ban", minrank: 1, action: 'banPlayer' },
    { name: "Kick", minrank: 1, action: 'kickPlayer' },
    { name: "Teleport", minrank: 1, action: 'tpPlayer' },
    //{ name: "Freeze", minrank: 1, action: 'freezePlayer'},
    { name: "Set HP", minrank: 1, action: 'setHP'},
    { name: "Set admin rank", minrank: 2, action: 'setAdminRank'},
    { name: "Give Weapon", minrank: 1, action: 'weaponMenu'}
  ];

  //$scope.localPlayer = adminPanelService.localPlayer;
  //$scope.showPlayers = $scope.adm.players;
  //$scope.selectedPlayer = $scope.adm.selectedPlayer;

  $scope.refreshPlayerList = function() {
    console.log("Requested refresh player list")
    jcmp.CallEvent('adminsys/client/request_update_playerList');
  }

  $scope.playerSelected = function($event) {

    var el = angular.element($event.target);
    var ulParent = el.parent().parent().children('ng-repeat').children('.clicked');

    ulParent.removeClass("clicked");
    el.addClass("clicked");

    var playerId = parseInt(el.attr("playerId"));

    var index = adminPanelService.players.findIndex(function(e) {
      return e.networkId === playerId;
    });

    //console.log(adminPanelService.players[index]);

    //adminPanelService.updateSelectedPlayer(adminPanelService.players[index]);
    adminPanelService.selectedPlayer = adminPanelService.players[index];

    //$scope.selectedPlayer = adminPanelService.players[index];
    /*
    console.log(adminPanelService.selectedPlayer);
    console.log($scope.adm.selectedPlayer);*/

  }

  $scope.executeAction = function($event, playerId) {

    var el = angular.element($event.target);
    var option = el.attr('optionid');

    playerId = parseInt(playerId);

    if(playerId < 0) {
      return console.log('Invalid player ID');
    }

    var player = adminPanelService.selectedPlayer;

    console.log("Option ID selected:" + option);

    var action = $scope.footerOptions[option].action;

    if(Object.keys(Action).indexOf(action) < 0) {
      return console.log("Invalid option to execute");
    }

    Action[action](player);

  }

}])

app.controller("header", function($scope, adminPanelService) {
  $scope.adm = adminPanelService;
})

app.controller("modalAction", function($scope, adminPanelService) {
  $scope.adm = adminPanelService;
});

app.controller("tabsController", function($scope) {
  $scope.reqUpdateBans = function() {
    console.log("Requesting update banlist");
    jcmp.CallEvent('adminsys/client/req/update_banlist');
  }
});

app.controller("banlist", function($rootScope, $scope, adminPanelService) {

  $scope.bannedPlayer_info = {};
  //$scope.players_banlist = adminPanelService.generatePlayers();
  $scope.players_banlist = [];

  jcmp.AddEvent('adminsys/ui/update_banlist', function(data) {
    //$scope.players_banlist = JSON.parse(data);
    //console.log(JSON.parse(data));
    $scope.players_banlist = JSON.parse(data);
    $scope.$apply();
  });


  $scope.searchPlayer = function() {
    var filter = $("#filterType").html().toLowerCase().replace(" ", "");
    //console.log($scope.searchValue);

    var data = {
      filter: filter,
      value: $scope.searchValue
    }

    //console.log(data);

    jcmp.CallEvent('adminsys/client/searchBanPlayer', JSON.stringify(data));
  }


  $scope.banDetails = function(index) {

    $scope.bannedPlayer_info = $scope.players_banlist[index];

    //console.log($scope.bannedPlayer_info);
    $scope.$$postDigest(function() {
      Action.unbanPlayer($scope.bannedPlayer_info); // Shows the ui with details of the banned player
    })
  }; // End of view Details function

});

app.controller("spawnMenuControl", function($scope, adminPanelService) {

  $scope.adm = adminPanelService;
  $scope.weaponsGrouped = weapons.GroupBy('class');
  $scope.weapon_groups = Object.keys($scope.weaponsGrouped);
  $scope.ammoQuantity = 300;

  $scope.spawnWeapon = function(weaponhash) {
    /*console.log(weaponhash);
    console.log($scope.weaponsGrouped);
    console.log($scope.weapon_groups);*/

    Action.spawnWeapon(adminPanelService.selectedPlayer, weaponhash, $scope.ammoQuantity);
  }

});
