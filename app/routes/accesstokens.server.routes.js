'use strict';
module.exports = function(app) {
  var accesstokens = require('../controllers/accesstokens');
  app.route('/generaprueba')
  .get(accesstokens.generaPrueba);

  // params: prefix
  app.route('/obtiene-app-at')
  .get(accesstokens.obtieneAppAText)
  .post(accesstokens.obtieneAppAText);

  // params: cuenta, prefix;
  app.route('/obtiene-usrs-at')
  .get(accesstokens.obtieneUsrsAText)
  .post(accesstokens.obtieneUsrsAText);

  // params: cuenta, page_id, prefix;
  app.route('/obtiene-pag-at')
  .get(accesstokens.obtienePagATsext)
  .post(accesstokens.obtienePagATsext);

  // params: username, prefix;
  app.route('/comprueba-usr-at')
  .get(accesstokens.compruebaUnUsrAText)
  .post(accesstokens.compruebaUnUsrAText);

  // params: cuenta, page_id, user_aid, fb_usid, us_token, prefix
  app.route('/obtiene-pagat-byusrat')
  .get(accesstokens.obtienePagATByUsrAText)
  .post(accesstokens.obtienePagATByUsrAText);
};




