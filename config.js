module.exports = {
  colours: {
      connection: new RGB(255, 140, 0),
      command_success: new RGB(0, 255, 0),
      command_fail: new RGB(255, 0, 0),
      group_message: new RGB(255, 204, 195),
      red: new RGB(255, 0, 0),
      green: new RGB(0, 255, 0),
      orange: new RGB(255, 140, 0),
      purple: new RGB(220, 198, 224),
  },
  mongodb: {
    url: 'mongodb://192.168.1.211:27017/adminsys'
  },
  admins: [
    "76561198030848245"
  ],
  banonjoin: true // For debug purposes
}
