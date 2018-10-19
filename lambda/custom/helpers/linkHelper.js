module.exports = function buildApiLink (choice, title) {
  const type = (choice === 'film') ? 'movies' : 'shows'
  return 'https://api.betaseries.com/' + type + '/search?key=' + process.env.BETASERIES_KEY_API + '&title=' + title
}
