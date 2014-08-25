exports.configure = function(express, app, passport) {
  console.log('Configuring routes');

  require('../routes/authentication')(express.Router(), app, passport);
  require('../routes/view')(express.Router(), app);
  require('../routes/cover')(express.Router(), app);
  require('../routes/artist')(express.Router(), app);
  require('../routes/user')(express.Router(), app);
  require('../routes/search')(express.Router(), app);
  require('../routes/upload')(express.Router(), app);
  require('../routes/index')(express.Router(), app);
}