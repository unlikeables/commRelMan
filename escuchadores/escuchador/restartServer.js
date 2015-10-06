var cmd = require("cmd-exec").init();
module.exports= {
	restart: function() {
cmd.exec("pm2 restart escuchador", function(err, res){
  if (err) {
   console.log(err.message);
  } else {
    console.log(res.message);
  }
});
}
};
