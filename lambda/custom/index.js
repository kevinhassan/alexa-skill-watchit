'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Bonjour et bienvenue dans la skill WatchIt que puis-je faire pour vous ?');
    },
    'GetSynopsisFilmIntent': function() {
        // Make a request for a user with a given ID
        const movieName = cleanUpSpecialChars(this.event.request.intent.slots.movie.value);
        const negativeResponseSynopsis = [
            'Désolé je ne parviens pas à retrouver le résumé du film' + movieName,
            'Je n\'ai pas pu trouver le résumé du film que vous avez demandé',
            'Oups je n\ai pas trouver le résume du film' + movieName
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
                    this.response.speak("Le résumé de " + movieName + " est :" + speechOutput) //.emit(':responseReady');
                    this.emit(':responseReady');

                    //this.emit(':ask', "Que puis-je faire d'autres pour vous ?");
                } else {
                    const responseIndex = Math.floor(Math.random() * Math.floor(negativeResponseSynopsis.length));
                    this.response.speak(negativeResponseSynopsis[responseIndex])
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

function cleanUpSpecialChars(str) {
    return str
        .replace(/[ÀÁÂÃÄÅ]/g, "A")
        .replace(/[àáâãäå]/g, "a")
        .replace(/[ÈÉÊË]/g, "E")
        .replace(/[èéêë]/g, "e")
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};