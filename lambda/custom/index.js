'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');
var tools = require('./util');

var choice = ''
const randomQuestionsAfterSynopsis = [
    "Que puis-je faire d'autres pour vous ? Je peux aussi vous donner le résumé d'une série ",
    "Que voulez vous faire maintenant ? Je peux vous donner les personnage de ce film",
    " Je vo"
]

const sentenceForSynopsis = [
    "Le résumé de {movie}",
    "Le film {movie}",
    "Trouve moi le résumé de {movie}",
    "Trouve moi le  résumé du film {movie}",
    "Quel est le résumé du film {movie}",
    "Donne moi le résumé du film {movie}",
    "Donne moi le résumé de {movie}"
]

const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Bonjour et bienvenue dans la skill WatchIt.\nJe peux vous donner des caractéristiques de films ou de séries. Lequel voulez-vous ?')
        this.response.listen("Je peux vous donner des caractéristiques de films ou de séries. Lequel voulez-vous ?")
    },

    'HandleChoiceIntent': function() {
        const choice = tools.clean(this.event.request.intent.slots.choice.value)
        if (choice == 'film') {
            const responseChoiceIndex = Math.floor(Math.random() * Math.floor(sentenceForSynopsis.length));
            this.response.speak("Voila quelques phrases que vous pouvez dire : \n\n" + sentenceForSynopsis[responseChoiceIndex])
            this.response.listen()
            this.emit(":responseReady")

        } else if (choice == 'serie') {
            this.emit(':ask', 'C\'est Joris qui doit le faire')
            this.emit(":responseReady")

        } else {
            this.response.speak("Vous devez choisir entre film et serie. \n Voila quelques phrases que vous pouvez dire : ")
            this.response.listen()
            this.emit(":responseReady")
        }

    },
    'GetSynopsisFilmIntent': function() {
        // Make a request for a user with a given ID
        const movieName = tools.clean(this.event.request.intent.slots.movie.value);
        const negativeResponseSynopsis = [
            'Désolé je ne parviens pas à retrouver le résumé du film ' + movieName,
            'Je n\'ai pas pu trouver le résumé du film que vous avez demandé',
            'Oups je n\ai pas trouver le résume du film ' + movieName
        ];

        https.get('https://api.betaseries.com/movies/search?key=fc9ace0877d3&title=' + movieName, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {

                const moviesData = JSON.parse(data)
                if (moviesData.movies.length != 0) {
                    const speechOutput = moviesData.movies[0].synopsis
                    this.response.speak("Le résumé de " + movieName + " est : " + speechOutput + ".\n Que puis-je faire d'autres pour vous ?") //.emit(':responseReady');
                    this.response.listen("Que puis-je faire d'autres pour vous ?")
                    this.emit(":responseReady")
                } else {
                    const responseIndex = Math.floor(Math.random() * Math.floor(negativeResponseSynopsis.length));
                    this.response.speak(negativeResponseSynopsis[responseIndex])
                    this.response.listen("Que puis-je faire d'autres pour vous ?")
                    this.emit(':responseReady');

                    //this.emit(':ask', "Que puis-je faire d'autres pour vous ?");
                }
            });

        })


        /*.catch(function(error) {
                        this.response.speak("Impossible de trouver le résumé de ce film");
                        this.emit(':ask', "Que puis-je faire d'autres pour vous ?");
                    })*/
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};


exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
}