module.exports = function convert (type, length) {
  var hour = 0
  var minute = 0
  if (type === 'film') {
    hour = Math.trunc(length / 3600)
    minute = (length / 60) % 60
  } else {
    hour = Math.trunc(length / 60)
    minute = length % 60
  }
  var output = ''
  output += (hour < 2) ? hour + ' heure' : hour + ' heures'
  output += (minute < 2) ? ' et ' + minute + ' minute' : ' et ' + minute + ' minutes'
  return output
}
