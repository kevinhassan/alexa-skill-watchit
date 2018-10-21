module.exports = {
  movieExist: function (response) {
    return response.data && response.data.movies && response.data.movies.length !== 0
  },
  serieExist: function (response) {
    return response.data && response.data.shows && response.data.shows.length !== 0
  }
}
