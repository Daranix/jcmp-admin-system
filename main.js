

jcmp.events.AddRemoteCallable('adminsys_doAction', function(player, action, argsData) {
  console.log(action);
  console.log(argsData);
});

console.log("adminSys started");


global.adminsys = {
  config: require('./config.js'),
  commands: jcmp.events.Call('get_command_manager')[0],
  chat: jcmp.events.Call('get_chat')[0],
  utils: require('./utility/utility.js'),
  workarounds: require('./utility/workarounds'),
  actions: require('./utility/actions.js'),
  mongodb: require('mongodb').MongoClient
}

main();

function main() {

  console.log("[AdminSYS] Checking the connection to the mongoDB Server");
  adminsys.mongodb.connect(adminsys.config.mongodb.url, function(err, db) {


    if(err) {
      console.error(err);

    } else {
      console.log("[AdminSYS] MongoDB Server: " + adminsys.config.mongodb.url + " is connected");
    }

    db.close();
  });

  // load all commands from the 'commands' directory
  adminsys.commands.loadFromDirectory(`${__dirname}/commands`, (f, ...a) => require(f)(...a));

  // load all event files from the 'events' directory
  adminsys.utils.loadFilesFromDirectory(`${__dirname}/events`);


}
