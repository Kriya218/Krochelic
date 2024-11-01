module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this) 
  },
  pathCheck: path => path.startsWith('upload/') ? `/${path}` : path
}