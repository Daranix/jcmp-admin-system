/*$(document).ready(function() {

  var weaponsGrouped = weapons.GroupBy('class');
  var weapon_groups = Object.keys(weaponsGrouped);

  for(var i = 0; i < weapon_groups.length; i++) {
    $("#weaponContainer").append('<h4>' + weapon_groups[i].asTitle() + '</h4>');
    var cat = weapon_groups[i];
    //console.log(cat)
    $("#weaponContainer").append(`
      <ul id="weapon-${cat}" class="vertical-menu-list"></ul>
    `);

    for(var c = 0; c < weaponsGrouped[cat].length; c++) {
        $("#weapon-" + cat).append(`<li ng-click="spawnWeapon(${weaponsGrouped[cat][c].hash})">${weaponsGrouped[cat][c].name}</li>`)
    }
  }

})*/
