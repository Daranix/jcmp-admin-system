var category = ['Car', 'Motorbike', 'Helicopter', 'Plane', 'Boat'];

$(document).ready(function() {

  // Render spawn menu

  for(var i = 0; i < category.length; i++) {
    $("#spawnTabs").append(`
      <li><a href="#spawn-${category[i]}" data-toggle="tab">${category[i]}</a></li>
      `);

      vehCat = vehicles.filter(function(v) {

        return (v.dlc === null && v.type === category[i].toLowerCase());
      });

      //console.log(vehCat);

      $("#spawnTabsContent").append(`
        <div class="tab-pane fade in" id="spawn-${category[i]}">
          <h3>${category[i]}</h3>
          <ul class="vertical-menu-list column" id="spawnTabsList-${category[i]}">
          </ul>
        </div>
        `);

        var element = $("#spawnTabsList-" + category[i]);

        for(var c = 0; c < vehCat.length; c++) {

            var tooltip = `<span class='title'>${vehCat[c].name}</span><br><img src='./img/vehicles/${vehCat[c].model_name}.png'/>`

            element.append(`
              <li class="list-vehicles" onclick="spawnVehicle(${vehCat[c].hash})" data-toggle="tooltip" data-placement="left" title="${tooltip}">
                <span class="vname">${vehCat[c].name}</span>
                <span class="vmodel hidden">${vehCat[c].model_name}</span>
              </li>
              `)
        }
  }

  $('.nav-tabs a[href="#spawn-' + category[0] + '"]').tab('show'); // Show first tab of spawn menu
  $('[data-toggle="tooltip"]').tooltip({ html: true, template: `<div class="tooltip tooltip-cars" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>` })

});

function spawnVehicle(hash) {
  console.log("Trying to spawn vehicle with hash: " + hash);
  jcmp.CallEvent('adminsys/client/spawnVehicle', hash);
}
