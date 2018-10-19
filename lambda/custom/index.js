'use strict'
const Alexa = require('alexa-sdk')
const axios = require('axios')
const Helpers = require('./helpers')

const randomQuestionsAfterSynopsis = [
    "Que puis-je faire d'autres pour vous ? Je peux aussi vous donner le résumé d'une série ",
    "Que voulez vous faire maintenant ? Je peux vous donner les personnage de ce film",
    " Je vo"
]



const sentenceForSynopsis = [
    "Le résumé de {nom de l'oeuvre}",
    "{nom de l'oeuvre}",
    "Trouve moi le résumé de {nom de l'oeuvre}",
    "Quel est le résumé de {nom de l'oeuvre}",
    "Donne moi le résumé de {nom de l'oeuvre}",
]

const resumeNotExist = [
    "Je n'ai pas trouvé le résumé de ",
    "Trouvé n'a pas été le résumé de ",
    "Oups je n'ai pas réussi à trouver le résumé de "
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
            this.attributes.choice = (choice === 'film' || choice === 'serie') ? choice : ''
            return this.emit(':ask', 'Quel information voulez-vous obtenir ?').listen("Veuillez indiquer l'information que vous voulez obtenir ?")
        }
    },
    'GetSynopsisIntent': function() {
        const title = this.event.request.intent.slots.title.value
        if (this.attributes.choice) {
            axios.get(Helpers.linkHelper(this.attributes.choice, title))
                .then(function(response) {
                    if (response.data) {
                        // TODO: renvoyer les 3 premiers résultats
                        const synopsis = (this.attributes.choice === 'film') ? response.data.movies[0] : response.data.shows[0]
                        this.attributes.title = title
                            // TODO: ne pas lire tout le résumé d'un coup
                        this.response.speak(synopsis)
                        return this.emit(':responseReady')
                    } else {
                        const responseChoiceIndex = Math.floor(Math.random() * Math.floor(sentenceForSynopsis.length));
                        return this.emit(':ask', sentenceForSynopsis[responseChoiceIndex] + title, 'De quel ' + this.attributes.choice + ' voulez-vous obtenir le résumé ?').listen()
                    }
                })
                .catch(function(err) {
                    console.error(err)
                        // TODO: utiliser un error handler de alexa ?
                    const responseChoiceIndex = Math.floor(Math.random() * Math.floor(errorResponses.length));
                    return this.emit(':ask', errorResponses[responseChoiceIndex]).listen()
                })
        } else {
            return this.emit(':ask', 'Est-ce une série ou un film ?', "Veuillez indiquer s'il s'agit d'une série ou d'un film")
        }
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = HELP_MESSAGE
        const reprompt = HELP_REPROMPT

        this.response.speak(speechOutput).listen(reprompt)
        this.emit(':responseReady')
    },
    'AMAZON.CancelIntent': function() {
        this.response.speak(STOP_MESSAGE)
        this.emit(':responseReady')
    },
    'AMAZON.StopIntent': function() {
        this.response.speak(STOP_MESSAGE)
        this.emit(':responseReady')
    }
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback)
    alexa.appId = process.env.APP_ID
    alexa.registerHandlers(handlers)
    alexa.execute()
}