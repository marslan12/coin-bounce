const { ValidationError } = require("joi");

const errorHandler = (error, req, res, next) => {
  let status = 500;
  let data = {
    message: "Interval Server Error",
  };

  if (error instanceof ValidationError) {
    status = 403;
    data.message = error.message;
  }

  if (error.status) {
    status = error.status;
  }

  if (error.message) {
    data.message = error.message;
  }

  return res.status(status).json(data);
};

module.exports = errorHandler;
