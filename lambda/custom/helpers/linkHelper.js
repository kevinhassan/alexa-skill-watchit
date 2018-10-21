module.exports = function buildApiLink(choice, params, needs) {
    const type = (choice === 'film') ? 'movies' : 'shows'
    var apiUrl = 'https://api.betaseries.com/' + type + '/' + needs + '?key=' + process.env.BETASERIES_KEY_API
    Object.keys(params).map(function(key) {
        apiUrl += '&' + key + '=' + params[key]
    })
    return encodeURI(apiUrl)
}