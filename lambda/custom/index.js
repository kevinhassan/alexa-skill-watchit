'use strict'
const Alexa = require('alexa-sdk')
const axios = require('axios')
const Helpers = require('./helpers')
const Utils = require('./utils')

const SynopsisUtterance = [
    "Trouve moi le résumé de Arrow",
    "Quel est le résumé de Arrow",
    "Donne moi le résumé de Arrow",
    "Résumé de Arrow"
]

const resumeNotExist = [
    "Je n'ai pas trouvé le résumé de ",
    "Trouvé n'a pas été le résumé de ",
    "Oups je n'ai pas réussi à trouver le résumé de "
]

const yearUtterance = [
    "Année de Flash",
    "Année de création Flash",
    "Quel est l'année de Flash",
    "Quel est l'année de création de Flash",
    "En quel année a été créé Flash",
    "L'année de creation de Flash"
]

const lengthUtterrance = [
    "Donne moi la durée de Flash",
    "Quel est la durée de Flash",
    "Durée de Flash"
]

const genreUtterance = [
    "Donne moi le genre de Flash",
    "Quel est le genre de Flash",
    "Quel sont les genres de Flash",
    "Genre de Flash"
]

const numberSeasonUtterance = [
    "Quel est la dernière saison de Flash",
    "Quel est la dernière saison de la série Flash",
    "Combien de saison a la série Flash ",
    "Combien de saison a Flash ",
    "Trouve moi le nombre de saison de Flash",
    "Trouve moi le nombre de saison de la série Flash"
]

const numberEpisodesUtterance = [
    "Combien d'épisode a la saison 1 de Flash",
    "Combien d'épisode a la saison 1 de la série Flash",
    "Combien d'épisode a Flash",
    "Combien d'épisode a la série Flash",
    "Combien il y a t-il d'épisode a la série Flash",
    "Combien il y a t-il d'épisode sur Flash",
    "Combien il y a t-il d'épisode sur la série Flash",
    "Combien il y a t-il d'épisode a la saison 1 de Flash",
    "Combien il y a t-il d'épisode sur la saison 1 de Flash"
]

const dernierEpisodeUtterance = [
    "Dernier épisode de la série Flash",
    "Donne moi le dernier épisode de la série Flash",
    "Donne moi le dernier épisode de Flash",
    "Dernier épisode de Flash",
    "Quel est le dernier épisode de Flash"
]

const directorMovieUtterance = [
    "Qui a réalisé le film Flash",
    "Qui a réalisé Flash",
    "Réalisateur de Flash",
    "Qui est le réalisateur de Flash"
]

const markUtterance = [
    "Note moyenne de Flash ",
    "Quelle est la note moyenne de Flash ",
    "Note de Flash ",
    "Quelle est la note de Flash"
]

const networkUtterance = [
    "Qui est le diffuseur de la série Flash",
    "Qui est le diffuseur de Flash",
    "Où puis je voir la série Flash",
    "Qui diffuse la série Flash",
    "Où puis je voir Flash",
    "Qui diffuse Flash"
]

const charactersUtterance = [
    "Quels sont les personnages de Arrow",
    "Les personnages de Arrow",
    "Qui joue dans Arrow"
]
const choiceUtterance = [
    'Que voulez vous savoir ? ',
    'Quelles informations voulez vous obtenir ?'
]

const oeuvreNotFound = [
    'Aucune information n\'a été trouvé concernant l\'oeuvre .',
    'L\'oeuvre que vous cherchez n\'existe pas sur Bétaseries.',
    'Bétaseries ton oeuvre n\'a pas'
]

const infNotFound = [
    "L'information que vous avez demandé n'existe pas",
    "L'information que vous cherchez n'a pas été trouvée",
    "Désolé je ne parvient pas à trouver l'information que vous voulez"
]

/*const charactersFilmUtterance = [

]*/

const errorResponses = [
    "BetaSeries n'est pas disponible pour le moment, Veuillez réessayer plus tard.",
    "Oups BetaSeries n'a pas répondu. Réessayer dans un petit moment."
]

const networkNotFound = [
    "Aucunes informations n'a été trouvée sur le diffuseur de ",
    "Bétaséries ne détient pas d'information sur le diffuseur de "
]

const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Bonjour et bienvenue dans la skill WatchIt. Dites série pour des information sur une série ou film si vous voulez des informations sur un film', 'Voulez-vous des informations sur une série ou un film ?')
    },
    'ChoiceIntent': function() {
        if (this.event.request.intent.slots.choice.value) {
            const choice = this.event.request.intent.slots.choice.value
            if (choice === 'film' || choice === 'série') {
                this.attributes.choice = choice
                return this.emit(':ask', Helpers.responseHelper(choiceUtterance)).listen("Veuillez indiquer l'information que vous voulez obtenir ?")
            }
        }
        return this.emit(':ask', 'Je n\'ai pas compris. Dites série pour des informations sur une série ou film si vous voulez des informations sur un film').listen("Veuillez indiquer s'il s'agit d'une série ou un film ?")
    },
    'GetSynopsisIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist || Utils.request.serieExist) {
                        const synopsis = (vm.attributes.choice === 'film') ? response.data.movies[0].synopsis : response.data.shows[0].description
                        vm.attributes.title = title
                        vm.response.speak(synopsis +
                            'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(genreUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)).listen()

                        return vm.emit(':responseReady')
                    } else {
                        vm.response.speak(Helpers.responseHelper(resumeNotExist))
                        return vm.emit(':ask', Helpers.responseHelper(resumeNotExist) + title, 'De quel ' + vm.attributes.choice + ' voulez-vous obtenir le résumé ?')
                    }
                })
                .catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetNetworkIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
            .then(function(response) {
                if (Utils.request.serieExist(response)) {
                    var speechOutput = 'Le diffuseur de la série ' + title + ' est : '
                    if (response.data.shows[0].network) {
                        speechOutput += response.data.shows[0].network
                    } else {
                        vm.response.speak(Helpers.responseHelper(networkNotFound) + title).listen()
                        return vm.emit(':responseReady')
                    }
                    vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                        Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(dernierEpisodeUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance) + '<break time="1s"/>' + Helpers.responseHelper(numberSeasonUtterance)).listen()
                    return vm.emit(':responseReady')
                } else {
                    vm.response.speak(Helpers.responseHelper(oeuvreNotFound)).listen()
                    return vm.emit(':responseReady')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', Helpers.responseHelper(errorResponses))
            })
    },
    'GetMarkIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist || Utils.request.serieExist) {
                        const mark = (vm.attributes.choice === 'film') ? response.data.movies[0].notes.mean : response.data.shows[0].notes.mean
                        vm.attributes.title = title
                        const speechOutput = 'La note moyenne de ' + title + ' est : ' + mark + 'sur 5'
                        vm.response.speak(speechOutput + speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(charactersUtterance) + '<break time="1s"/>' + Helpers.responseHelper(directorMovieUtterance)).listen()
                        return vm.emit(':responseReady')
                    } else {
                        vm.response.speak(Helpers.responseHelper(oeuvreNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                })
                .catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetYearIntent': function() {
        const vm = this
        const title = this.event.request.intent.slots.title.value
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    const year = (vm.attributes.choice === 'film') ? response.data.movies[0].production_year : response.data.shows[0].creation
                    const speechOutput = "L'année de création de " + title + ' est ' + year + '.'
                    vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                        Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(genreUtterance) + '<break time="1s"/>' + Helpers.responseHelper(lengthUtterrance)
                    ).listen('Quels autres informations voulez vous obtenir ?')
                    return vm.emit(':responseReady')
                })
                .catch(function(err) {
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

    'GetNumberSeasonIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
            .then(function(response) {
                if (Utils.request.serieExist(response)) {
                    const nbSeason = response.data.shows[0].seasons
                    var speechOutput = 'La série ' + title + ' a ' + nbSeason
                    speechOutput += (nbSeason === 1) ? ' saison' : ' saisons'
                    vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                        Helpers.responseHelper(numberEpisodesUtterance) + '<break time="1s"/>' + Helpers.responseHelper(lengthUtterrance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                    ).listen()
                    return vm.emit(':responseReady')
                } else {
                    return vm.emit(':ask', "Je n'ai pas trouvé le nombre de saison de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre de saison ?')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
            })
    },
    'GetNumberEpisodesIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
            .then(function(response) {
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
                    vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                        Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(genreUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                    ).listen()
                    return vm.emit(':responseReady')
                } else {
                    return vm.emit(':ask', "Je n'ai pas trouvé le nombre d'épisode de la série : " + title, 'Sur quel série voulez-vous obtenir le nombre d\'épisode ?')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', 'Une erreur est survenue. Veuillez réessayer.')
            })
    },
    'GetDirectorMovieIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'film'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
            .then(function(response) {
                if (Utils.request.movieExist(response)) {
                    var speechOutput = 'Le film ' + title
                    if (response.data.movies[0].director) {
                        const director = response.data.movies[0].director
                        speechOutput += ' a été réalisé par : ' + director
                    } else {
                        speechOutput = 'Aucune information n`a été trouvé concernant le réalisateur du film ' + title
                    }
                    vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                        Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(genreUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                    ).listen()
                    return vm.emit(':responseReady')
                } else {
                    vm.response.speak(Helpers.responseHelper(oeuvreNotFound)).listen()
                    return vm.emit(':responseReady')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', Helpers.responseHelper(errorResponses))
            })
    },
    'GetLengthIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
                        const length = (vm.attributes.choice === 'film') ? Utils.time('film', response.data.movies[0].length) : Utils.time('série', response.data.shows[0].length)
                        const speechOutput = 'La durée de ' + title + ' est de : ' + length
                        vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(genreUtterance) + '<break time="1s"/>' + Helpers.responseHelper(yearUtterance)
                        ).listen()
                        return vm.emit(':responseReady')
                    } else {
                        vm.response.speak(Helpers.responseHelper(oeuvreNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                }).catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetLastEpisodeIntent': function() {
        const title = this.event.request.intent.slots.title.value
        this.attributes.choice = 'série'
        const vm = this
        axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
            .then(function(response) {
                if (Utils.request.serieExist(response)) {
                    var speechOutput = 'Le dernier épisode de la série ' + title
                    var nbEpisode = -1
                    if (response.data.shows[0].seasons_details) {
                        const nbSeason = response.data.shows[0].seasons_details.length
                        nbEpisode = response.data.shows[0].seasons_details[nbSeason - 1].episodes
                        speechOutput += ' est l\'épisode ' + nbEpisode + ' de la saison ' + nbSeason
                        vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(numberEpisodesUtterance) + '<break time="1s"/>' + Helpers.responseHelper(numberSeasonUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                        ).listen()
                        return vm.emit(':responseReady')
                    } else {
                        vm.response.speak(Helpers.responseHelper(infNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                } else {
                    vm.response.speak(Helpers.responseHelper(oeuvreNotFound)).listen()
                    return vm.emit(':responseBody')
                }
            })
            .catch(function(err) {
                console.error(err)
                return vm.emit(':ask', Helpers.responseHelper(errorResponses))
            })
    },
    'GetGenreIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
                        const genres = (vm.attributes.choice === 'film') ? response.data.movies[0].genres : response.data.shows[0].genres
                        const speechOutput = title + ' a pour genre : ' + genres.join(', ')

                        vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                            Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                        ).listen()
                        return vm.emit(':responseReady')
                    } else {
                        vm.response.speak(Helpers.responseHelper(infNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                }).catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetCharactersIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
                        const id = (vm.attributes.choice === 'film') ? response.data.movies[0].id : response.data.shows[0].id
                        var speechOutput = 'Les acteurs de ' + title + 'sont : '
                        const vm2 = vm
                        axios.get(Helpers.linkHelper(vm2.attributes.choice, { 'id': id }, 'characters'))
                            .then(function(response2) {

                                if (response2.data.characters.length > 5) {
                                    const firstFives = response2.data.characters.splice(0, 4)
                                    firstFives.forEach(function(item, index, array) {
                                        speechOutput += '<break time="1s"/>' + item.actor + " dans le role de : " + item.name
                                    })
                                } else {
                                    firstFives.forEach(function(item, index, array) {
                                        speechOutput += '<break time="1s"/>' + item.actor + " dans le role de : " + item.name
                                    })
                                }
                                vm2.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                                    Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                                ).listen()
                                return vm2.emit(':responseReady')

                            }).catch(function(err) {
                                console.error(err)
                                return vm2.emit(':ask', Helpers.responseHelper(errorResponses))
                            })
                    } else {
                        vm.response.speak(Helpers.responseHelper(infNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                }).catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'GetSimilarsIntent': function() {
        const title = this.event.request.intent.slots.title.value
        const vm = this
        if (this.attributes && this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, { 'title': title }, 'search'))
                .then(function(response) {
                    if (Utils.request.movieExist(response) || Utils.request.serieExist(response)) {
                        const id = (vm.attributes.choice === 'film') ? response.data.movies[0].id : response.data.shows[0].id
                        var speechOutput = 'Les ' + vm.attributes.choice + 'similaires à ' + title + " sont : "
                        const vm2 = vm
                        axios.get(Helpers.linkHelper(vm.attributes.choice, { 'id': id }, 'similars'))
                            .then(function(response2) {
                                if (response2.data.similars.length > 0) {
                                    if (response2.data.similars.length > 5) {
                                        console.log(response2.data.similars.length)
                                        const firstFives = response2.data.similars.splice(0, 4)
                                        console.log(firstFives)
                                        firstFives.forEach(function(item, index, array) {
                                            speechOutput += '<break time="1s"/>' (vm.attributes.choice === 'film') ? item.movie_title : item.show_title
                                        })
                                    } else {
                                        firstFives.forEach(function(item, index, array) {
                                            speechOutput += '<break time="1s"/>' (vm.attributes.choice === 'film') ? item.movie_title : item.show_title
                                        })
                                    }
                                } else {
                                    speechOutput = 'Aucun ' + vm.attributes.choice + 'similaires à ' + title + "n'existe"
                                }

                                vm.response.speak(speechOutput + '<break time="1s"/>' + 'Voilà quelques exemples de phrases que vous pouvez dire pour aller plus loin dans votre recherche : ' +
                                    Helpers.responseHelper(yearUtterance) + '<break time="1s"/>' + Helpers.responseHelper(SynopsisUtterance) + '<break time="1s"/>' + Helpers.responseHelper(markUtterance)
                                ).listen()
                                return vm.emit(':responseReady')

                            }).catch(function(err) {
                                console.error(err)
                                return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                            })
                    } else {
                        vm.response.speak(Helpers.responseHelper(infNotFound)).listen()
                        return vm.emit(':responseReady')
                    }
                }).catch(function(err) {
                    console.error(err)
                    return vm.emit(':ask', Helpers.responseHelper(errorResponses))
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
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