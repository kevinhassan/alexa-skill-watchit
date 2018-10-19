'use strict'
const Alexa = require('alexa-sdk')
const axios = require('axios')
const Helpers = require('./helpers')

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

const anneeUtterance = [
    "Année",
    "Année de l'oeuvre"
]

const charactersFilmUtterance = [

]

const errorResponses = [
    "BetaSeries n'est pas disponible pour le moment, Veuillez réessayer plus tard.",
    "Oups BetaSeries n'a pas répondu. Réessayer dans un petit moment."
]

const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Bonjour et bienvenue dans la skill WatchIt. Voulez-vous des informations sur une série ou un film ?', 'Voulez-vous des informations sur une série ou un film ?')
    },
    'ChoiceIntent': function() {
        if (this.event.request.intent.slots.choice.value) {
            const choice = this.event.request.intent.slots.choice.value
            this.attributes.choice = (choice === 'film' || choice === 'série') ? choice : ''
            return this.emit(':ask', 'Quel information voulez-vous obtenir ?').listen("Veuillez indiquer l'information que vous voulez obtenir ?")
        } else {
            return this.emit(':ask', 'Voulez-vous des informations sur une série ou un film ?').listen("Veuillez indiquer s'il s'agit d'une série ou un film ?")
        }
    },
    'GetSynopsisIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, title))
                .then(function(response) {
                    if (response.data && response.data.movies.length != 0) {
                        // TODO: renvoyer les 3 premiers résultats
                        const synopsis = (vm.attributes.choice === 'film') ? response.data.movies[0].synopsis : response.data.shows[0].description
                        vm.attributes.title = title
                            // TODO: ne pas lire tout le résumé d'un coup
                        const responseAnneeIndex = Math.floor(Math.random() * Math.floor(anneeUtterance.length));

                        vm.response.speak(synopsis +
                            "Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : " +
                            anneeUtterance[responseAnneeIndex]).listen()

                        return vm.emit(':responseReady')
                    } else {
                        const responseIndex = Math.floor(Math.random() * Math.floor(resumeNotExist.length));
                        vm.response.speak(resumeNotExist[responseIndex])
                        return vm.emit(':ask', resumeNotExist[responseIndex] + title, 'De quel ' + vm.attributes.choice + ' voulez-vous obtenir le résumé ?')
                    }
                })
                .catch(function(err) {
                    console.error(err)
                    const responseIndex = Math.floor(Math.random() * Math.floor(errorResponses.length));
                    // TODO: utiliser un error handler de alexa ?
                    return vm.emit(':ask', errorResponses[responseIndex])
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetAnneeWithFixTitleIntent': function() {
        const vm = this
        if (this.attributes && this.attributes.choice) {
            if (this.attributes && this.attributes.title) {
                const title = vm.attributes.title
                axios.get(Helpers.linkHelper(this.attributes.choice, title))
                    .then(function(response) {
                        // TODO: renvoyer les 3 premiers résultats
                        const annee = (vm.attributes.choice === 'film') ? response.data.movies[0].production_year : response.data.shows[0].creation
                            // TODO: ne pas lire tout le résumé d'un coup
                        const responseSynopsisIndex = Math.floor(Math.random() * Math.floor(SynopsisUtterance.length));

                        vm.response.speak("L'année de création de " + vm.attributes.title + " est " + annee +
                            " Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : " +
                            SynopsisUtterance[responseSynopsisIndex]).listen()

                        return vm.emit(':responseReady')
                    })


            } else {
                vm.response.speak("Veuillez répéter la phrase et préciser un nom de " + vm.attributes.choice)
            }
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")

        }
    },
    'GetAnneeWithTitleIntent': function() {
        const vm = this
        const title = this.event.request.intent.slots.title.value
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, title))
                .then(function(response) {
                    // TODO: renvoyer les 3 premiers résultats
                    const annee = (vm.attributes.choice === 'film') ? response.data.movies[0].production_year : response.data.shows[0].creation
                        // TODO: ne pas lire tout le résumé d'un coup
                    const responseSynopsisIndex = Math.floor(Math.random() * Math.floor(SynopsisUtterance.length));

                    vm.response.speak("L'année de création de " + vm.attributes.title + " est " + annee +
                        " Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : " +
                        SynopsisUtterance[responseSynopsisIndex]).listen()

                    return vm.emit(':responseReady')
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")

        }


    },

    'GetNumberSeasonIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, title))
            .then(function(response) {
                if (response.data) {
                    const nbSeason = response.data.shows[0].seasons
                        // TODO: ne pas lire tout le résumé d'un coup
                    var speechOutput = 'La série ' + title + ' a ' + nbSeason
                    speechOutput += (nbSeason === 1) ? ' saison' : ' saisons'
                    vm.response.speak(speechOutput).listen()
                    return vm.emit(':responseReady')
                } else {
                    return vm.emit(':ask', "Je n'ai pas trouvé le nombre de saison de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre de saison ?')
                }
            })
            .catch(function(err) {
                console.error(err)
                    // TODO: utiliser un error handler de alexa ?
                return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
            })
    },
    'GetNumberEpisodesIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, title))
            .then(function(response) {
                if (response.data) {
                    if (vm.event.request.intent.slots.numberSeason && vm.event.request.intent.slots.numberSeason.value) {
                        const nbSeason = vm.event.request.intent.slots.numberSeason.value
                        if (response.data.shows[0]) {
                            if (response.data.shows[0].seasons_details[nbSeason - 1] && response.data.shows[0].seasons_details[nbSeason - 1].episodes) {
                                const nbEpisode = response.data.shows[0].seasons_details[nbSeason - 1].episodes
                                vm.response.speak('La série ' + title + ' saison ' + nbSeason + ' a ' + nbEpisode + ' épisodes.').listen()
                                return vm.emit(':responseReady')
                            } else {
                                vm.response.speak('La série ' + title + ' n\'a pas de saison ' + nbSeason).listen()
                                return vm.emit(':responseReady')
                            }
                        } else {
                            vm.response.speak('Aucune information concernant la série ' + title + '.').listen()
                            return vm.emit(':responseReady')
                        }
                    } else {
                        const nbEpisode = response.data.shows[0].episodes
                        vm.response.speak('La série ' + title + ' a ' + nbEpisode + ' épisodes.').listen()
                        return vm.emit(':responseReady')
                    }
                } else {
                    return vm.emit(':ask', "Je n'ai pas trouvé le nombre d'épisode de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre d\'épisode ?')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
            })
    },

    'AMAZON.HelpIntent': function() {
        this.response.speak('aide').listen('re aide')
        this.emit(':responseReady')
    },
    'AMAZON.CancelIntent': function() {
        this.response.speak('annuler')
        this.emit(':responseReady')
    },
    'AMAZON.StopIntent': function() {
        this.response.speak('stop')
        this.emit(':responseReady')
    }
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback)
    alexa.appId = process.env.APP_ID
    alexa.registerHandlers(handlers)
    alexa.execute()
}