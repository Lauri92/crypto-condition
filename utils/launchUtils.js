/*
 * No NODE_ENV defined -> Start on localhost
 * Else define logic how the application is launched; in this case Azure
 * No PORT ENV required
 */

const checkEnvironment = (app) => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  if (process.env.NODE_ENV === 'production') {
    try {
      const PORT = process.env.PORT;
      app.listen(PORT, () => console.log(`listening on ${PORT} (azure)`));
    } catch (e) {
      console.log(e.message);
    }
  } else {
    try {
      app.listen(3000);
      const d = new Date();
      console.log(
          `Started on localhost @ ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
    } catch (e) {
      console.log(e.message);
    }
  }
};

module.exports = {
  checkEnvironment,
};