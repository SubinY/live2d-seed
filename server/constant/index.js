module.exports = {
  BASE_URL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1"
      : "http://101.33.228.57",
};
