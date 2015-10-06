var cmd = require("cmd-exec").init();
module.exports= {
  restart: function() {
    cmd.exec("pm2 restart escuchador_trackers", function(err, res){
      if (err) {
        console.log(err.message);
        process.exit();
      } else {
        console.log(res.message);
        process.exit();
      }
    });
  }
};
