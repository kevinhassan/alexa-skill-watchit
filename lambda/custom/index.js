'use strict'
const Alexa = require('alexa-sdk')
const axios = require('axios')
const Helpers = require('./helpers')
const Utils = require('./utils')

const randomQuestionsAfterSynopsis = [
  "Que puis-je faire d'autres pour vous ? Je peux aussi vous donner le résumé d'une série ",
  'Que voulez vous faire maintenant ? Je peux vous donner les personnage de ce film',
  ' Je vo'
]

const SynopsisUtterance = [
  "Le résumé de {nom de l'oeuvre}",
  "{nom de l'oeuvre}",
  "Trouve moi le résumé de {nom de l'oeuvre}",
  "Quel est le résumé de {nom de l'oeuvre}",
  "Donne moi le résumé de {nom de l'oeuvre}"
]

const resumeNotExist = [
  "Je n'ai pas trouvé le résumé de ",
  "Trouvé n'a pas été le résumé de ",
  "Oups je n'ai pas réussi à trouver le résumé de "
]

const yearUtterance = [
  'Année',
  "Année de l'oeuvre"
]

const charactersFilmUtterance = [

]

const errorResponses = [
  "BetaSeries n'est pas disponible pour le moment, Veuillez réessayer plus tard.",
  "Oups BetaSeries n'a pas répondu. Réessayer dans un petit moment."
]

const handlers = {
  'LaunchRequest': function () {
    this.emit(':ask', 'Bonjour et bienvenue dans la skill WatchIt. Voulez-vous des informations sur une série ou un film ?', 'Voulez-vous des informations sur une série ou un film ?')
  },
  'ChoiceIntent': function () {
    if (this.event.request.intent.slots.choice.value) {
      const choice = this.event.request.intent.slots.choice.value
      if (choice === 'film' || choice === 'série') {
        this.attributes.choice = choice
        return this.emit(':ask', 'Quel information voulez-vous obtenir ?').listen("Veuillez indiquer l'information que vous voulez obtenir ?")
      }
    }
    return this.emit(':ask', 'Je n\'ai pas compris. Voulez-vous des informations sur une série ou un film ?').listen("Veuillez indiquer s'il s'agit d'une série ou un film ?")
  },
  'GetSynopsisIntent': function () {
    const title = this.event.request.intent.slots.title.value
    const vm = this
    if (this.attributes && this.attributes.choice) {
      axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
        .then(function (response) {
          if (Utils.request.movieExist || Utils.request.serieExist) {
            const synopsis = (vm.attributes.choice === 'film') ? response.data.movies[0].synopsis : response.data.shows[0].description
            vm.attributes.title = title
            vm.response.speak(synopsis +
                            'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(yearUtterance)).listen()

            return vm.emit(':responseReady')
          } else {
            vm.response.speak(Helpers.responseHelper(resumeNotExist))
            return vm.emit(':ask', Helpers.responseHelper(resumeNotExist) + title, 'De quel ' + vm.attributes.choice + ' voulez-vous obtenir le résumé ?')
          }
        })
        .catch(function (err) {
          console.error(err)
          return vm.emit(':ask', Helpers.responseHelper(errorResponses))
        })
    } else {
      return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
    }
  },
  'GetNetworkIntent': function () {
    const title = this.event.request.intent.slots.title.value
    this.attributes.choice = 'série'
    const vm = this
    axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
      .then(function (response) {
        if (Utils.request.serieExist(response)) {
          var speechOutput = 'Le diffuseur de la série ' + title + ' est : '
          if (response.data.shows[0].network) {
            speechOutput += response.data.shows[0].network
          } else {
            vm.response.speak('Aucune information\'a été trouvé concernant le diffuseur de la série ' + title).listen()
            return vm.emit(':responseReady')
          }
          vm.response.speak(speechOutput).listen()
          return vm.emit(':responseReady')
        } else {
          vm.response.speak('Aucune information n\'a été trouvé concernant la série.').listen()
          return vm.emit(':responseReady')
        }
      })
      .catch(function (err) {
        console.error(err)
        return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
      })
  },
  'GetMarkIntent': function () {
    const title = this.event.request.intent.slots.title.value
    const vm = this
    if (this.attributes && this.attributes.choice) {
      axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
        .then(function (response) {
          if (Utils.request.movieExist || Utils.request.serieExist) {
            const mark = (vm.attributes.choice === 'film') ? response.data.movies[0].notes.mean : response.data.shows[0].notes.mean
            vm.attributes.title = title
            vm.response.speak('La note moyenne de ' + title + ' est : ' + mark + 'sur 5').listen()
            return vm.emit(':responseReady')
          } else {
            vm.response.speak('Aucune information n\'a été trouvé.').listen()
            return vm.emit(':responseReady')
          }
        })
        .catch(function (err) {
          console.error(err)
          return vm.emit(':ask', Helpers.responseHelper(errorResponses))
        })
    } else {
      return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
    }
  },
  'GetYearIntent': function () {
    const vm = this
    const title = this.event.request.intent.slots.title.value
    if (this.attributes && this.attributes.choice) {
      axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
        .then(function (response) {
          const year = (vm.attributes.choice === 'film') ? response.data.movies[0].production_year : response.data.shows[0].creation
          vm.response.speak("L'année de création de " + title + ' est ' + year + '.').listen('Quels autres informations voulez vous obtenir ?')
          return vm.emit(':responseReady')
        })
        .catch(function (err) {
          console.error(err)
          var speechOutput = "Je n'ai pas trouvé l'année de création "
          speechOutput += (vm.attributes.choice === 'film') ? 'du film ' : 'de la série '
          vm.response.speak(speechOutput).listen()
          return vm.emit(':responseReady')
        })
    } else {
      return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
    }
  },

  'GetNumberSeasonIntent': function () {
    const title = this.event.request.intent.slots.title.value
    this.attributes.choice = 'série'
    const vm = this
    axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
      .then(function (response) {
        if (Utils.request.serieExist(response)) {
          const nbSeason = response.data.shows[0].seasons
          var speechOutput = 'La série ' + title + ' a ' + nbSeason
          speechOutput += (nbSeason === 1) ? ' saison' : ' saisons'
          vm.response.speak(speechOutput).listen()
          return vm.emit(':responseReady')
        } else {
          return vm.emit(':ask', "Je n'ai pas trouvé le nombre de saison de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre de saison ?')
        }
      })
      .catch(function (err) {
        console.error(err)
        return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
      })
  },
  'GetNumberEpisodesIntent': function () {
    const title = this.event.request.intent.slots.title.value
    this.attributes.choice = 'série'
    const vm = this
    axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
      .then(function (response) {
        if (Utils.request.serieExist(response)) {
          var speechOutput = 'La série ' + title
          var nbEpisode = -1
          if (vm.event.request.intent.slots.numberSeason && vm.event.request.intent.slots.numberSeason.value) {
            const nbSeason = vm.event.request.intent.slots.numberSeason.value
            if (response.data.shows[0].seasons_details[nbSeason - 1] && response.data.shows[0].seasons_details[nbSeason - 1].episodes) {
              nbEpisode = response.data.shows[0].seasons_details[nbSeason - 1].episodes
              speechOutput += ' saison ' + nbSeason
            } else {
              vm.response.speak('La série ' + title + ' n\'a pas de saison ' + nbSeason).listen()
              return vm.emit(':responseReady')
            }
          } else {
            nbEpisode = response.data.shows[0].episodes
          }
          speechOutput += ' a ' + nbEpisode
          speechOutput += (nbEpisode === 1) ? ' épisode.' : ' épisodes.'
          vm.response.speak(speechOutput).listen()
          return vm.emit(':responseReady')
        } else {
          return vm.emit(':ask', "Je n'ai pas trouvé le nombre d'épisode de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre d\'épisode ?')
        }
      })
      .catch(function (err) {
        console.error(err)
        return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
      })
  },
  'GetDirectorMovieIntent': function () {
    const title = this.event.request.intent.slots.title.value
    this.attributes.choice = 'film'
    const vm = this
    axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
      .then(function (response) {
        if (Utils.request.movieExist(response)) {
          var speechOutput = 'Le film ' + title
          if (response.data.movies[0].director) {
            const director = response.data.movies[0].director
            speechOutput += ' a été réalisé par : ' + director
          } else {
            speechOutput = 'Aucune information n`a été trouvé concernant le réalisateur du film ' + title
          }
          vm.response.speak(speechOutput).listen()
          return vm.emit(':responseReady')
        } else {
          vm.response.speak("Je n'ai pas trouvé d'informations sur ce film .").listen()
          return vm.emit(':responseReady')
        }
      })
      .catch(function (err) {
        console.error(err)
        return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
      })
  },
  'GetLengthIntent': function () {
    const title = this.event.request.intent.slots.title.value
    const vm = this
    if (this.attributes && this.attributes.choice) {
      axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
        .then(function (response) {
          if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
            const length = (vm.attributes.choice === 'film') ? Utils.time('film', response.data.movies[0].length) : Utils.time('série', response.data.shows[0].length)
            vm.response.speak('La durée de ' + title + ' est de : ' + length).listen()
            return vm.emit(':responseReady')
          } else {
            vm.response.speak('Aucune information trouvée.').listen()
            return vm.emit(':responseReady')
          }
        }).catch(function (err) {
          console.error(err)
          return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
        })
    } else {
      return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
    }
  },
  'GetLastEpisodeIntent': function () {
    const title = this.event.request.intent.slots.title.value
    this.attributes.choice = 'série'
    const vm = this
    axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
      .then(function (response) {
        if (Utils.request.serieExist(response)) {
          var speechOutput = 'Le dernier épisode de la série ' + title
          var nbEpisode = -1
          if (response.data.shows[0].seasons_details) {
            const nbSeason = response.data.shows[0].seasons_details.length
            nbEpisode = response.data.shows[0].seasons_details[nbSeason - 1].episodes
            speechOutput += ' est l\'épisode ' + nbEpisode + ' de la saison ' + nbSeason
            vm.response.speak(speechOutput).listen()
            return vm.emit(':responseReady')
          } else {
            vm.response.speak('Aucune information trouvée concernant la série.').listen()
            return vm.emit(':responseReady')
          }
        } else {
          vm.response.speak("Je n'ai pas trouvé d'informations sur la série").listen()
          return vm.emit(':responseBody')
        }
      })
      .catch(function (err) {
        console.error(err)
        return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
      })
  },
  'GetGenreIntent': function () {
    const title = this.event.request.intent.slots.title.value
    const vm = this
    if (this.attributes && this.attributes.choice) {
      axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }))
        .then(function (response) {
          if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
            const genres = (vm.attributes.choice === 'film') ? response.data.movies[0].genres : response.data.shows[0].genres
            vm.response.speak(title + ' a pour genre : ' + genres.join(', ')).listen()
            return vm.emit(':responseReady')
          } else {
            vm.response.speak('Aucune information trouvée sur le genre trouvé.').listen()
            return vm.emit(':responseReady')
          }
        }).catch(function (err) {
          console.error(err)
          return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
        })
    } else {
      return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
    }
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak('aide').listen('re aide')
    this.emit(':responseReady')
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak('annuler')
    this.emit(':responseReady')
  },
  'AMAZON.StopIntent': function () {
    this.response.speak('stop')
    this.emit(':responseReady')
  }
}

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = process.env.APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}
