/* eslint-disable arrow-body-style */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error("Error:", error); // Logs the error details to the console
      res.status(500).json({
        status: false,
        message: error.message || "An unexpected error occurred", // Sends a clean error message to the client
      });
    });
    //fn(req, res, next).catch(error => res.status(500).json({ status: false, message: error }));
  };
};
