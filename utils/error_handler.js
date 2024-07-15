function handleError(err) {
  if (process.env.DEBUG === 'true') {
    console.error('Detailed error:', err.stack);
  } else {
    console.error('An error occurred. Please try again later.');
  }
}

module.exports = {
  handleError
};