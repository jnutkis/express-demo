module.exports = function(app) {
  app.use((req, res, next) => {
    console.log('Check Headers...');
    console.log(req.headers);

    next();
  });
};
