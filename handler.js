'use strict';

require('dotenv').load();

const Alexa = require('alexa-sdk');
const fetch = require('node-fetch');

const SLACK_URL = process.env.SLACK_URL;

const notifySlack = message => {
  const body = {"text": message};
  const options = { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } };
  return fetch(SLACK_URL, options);
}

const handleItemStock = e => {
  const { slots: {ingredient, unit, quantity} } = e.request.intent;

  const hasUndefined = !ingredient.value || !unit.value || !quantity.value;

  if(hasUndefined) {
    return { then: () => ({status: false}) };
  } else {
    const message = `${quantity.value} ${unit.value} of ${ingredient.value}`;
    return notifySlack(message).then(() => ({status: true, message}));
  }
}

const handlersGenerator = (event, alexa) => Alexa.CreateStateHandler("", {
  LaunchRequest() {
    alexa.emit(':ask', "Hi, what would you like to do", "What would you like to do? You can say, take inventory");
  },

  IntentRequest() {
    alexa.emit(':ask', "Intent request", "Intent request.");
  },

  NotifyHQ() {
    const { slots: {newnote} } = event.request.intent;

    notifySlack(newnote.value)
      .then(() => {
        alexa.emit(':tell', `${newnote.value}, Ok I've notified them.`);
      });
  },

  StartTracking() {
    this.handler.state = "_TRACKING";
    alexa.emit(':ask', 'Ok let us start tracking', "I'm ready to start tracking, starting reading things off to me");
  },

  'AMAZON.StopIntent'() {
    alexa.emit(':tell', "Ok, bye.");
  },

  'AMAZON.CancelIntent'() {
    alexa.emit(':tell', "Ok, bye.");
  },

  TrackItem() {
    handleItemStock(event)
      .then(data => {
        if(data.status) {
          alexa.emit(':tell', `Got it, ${data.message}`);
        } else {
          alexa.emit(':ask', `Can you say that again?`);
        }
      });
  },

  SessionEndedRequest() {
    alexa.emit(':tell', "Ok, bye.");
  },

  Unhandled() {
    alexa.emit(':ask', "Sorry, can you repeat?");
  }
});

const trackingHandlersGenerator = (event, alexa) => Alexa.CreateStateHandler("_TRACKING", {
  NewSession() {
    alexa.emit("NewSession");
  },

  LaunchRequest() {
    alexa.emit("LaunchRequest");
  },

  IntentRequest() {
    alexa.emit("IntentRequest");
  },

  NotifyHQ() {
    const { slots: {newnote} } = event.request.intent;

    notifySlack(newnote.value)
      .then(() => {
        alexa.emit(':ask', `${newnote.value}, Ok I've notified them. Let's keep tracking.`, "Let's keep tracking");
      });
  },

  StartTracking() {
    alexa.emit(':ask', "Ok ready to go", "Let's keep tracking");
  },

  TrackItem() {
    handleItemStock(event)
      .then(data => {
        if(data.status) {
          alexa.emit(':ask', `Ok, ${data.message}`, "What's next");
        } else {
          alexa.emit(':ask', `Can you say that again?`);
        }
      });
  },

  'AMAZON.StopIntent'() {
    alexa.emit("AMAZON.StopIntent");
  },

  'AMAZON.CancelIntent'() {
    alexa.emit("AMAZON.CancelIntent");
  },

  SessionEndedRequest() {
    alexa.emit("SessionEndedRequest");
  },

  Unhandled() {
    alexa.emit("Unhandled");
  }
});

module.exports.parser = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlersGenerator(event, alexa), trackingHandlersGenerator(event, alexa));
  alexa.execute();
};
