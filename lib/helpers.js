/**
* @param  {Function} callback function to execute
* @param  {number}   wait     time in milliseconds
* @return {Function}
*/
function debounce(callback, wait) {
  let timeout;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => callback.apply(context, args), wait);
  };
}

module.exports = { debounce };
