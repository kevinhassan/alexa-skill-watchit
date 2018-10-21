module.exports = function randomResponse (responses) {
    const index = Math.floor(Math.random() * Math.floor(responses.length))    
    return responses[index]
  }
  