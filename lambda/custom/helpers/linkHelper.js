module.exports = function buildApiLink (choice, params) {
  const type = (choice === 'film') ? 'movies' : 'shows'
  var apiUrl = 'https://api.betaseries.com/' + type + '/search?key=' + process.env.BETASERIES_KEY_API
  Object.keys(params).map(function (key) {
    apiUrl += '&' + key + '=' + params[key]
  })
  return encodeURI(apiUrl)
}
