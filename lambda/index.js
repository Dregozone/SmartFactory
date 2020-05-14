// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Data  = require('data.json');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to the smart factory, ask me about upcoming schedule, downtime or picklists';
        const rePromptOutput = 'Try asking me about upcoming schedule, downtime or picklists';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(rePromptOutput)
            .getResponse();
    }
};

const WhatsRunningIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WhatsRunningIntent';
    },
    handle(handlerInput) {
        let lineNo   = handlerInput.requestEnvelope.request.intent.slots.lineNo.value;
        let when     = handlerInput.requestEnvelope.request.intent.slots.when.value;
        let timeSlot = handlerInput.requestEnvelope.request.intent.slots.timeSlot.value;
        
        const speechText = whatsRunningReply(lineNo, when, timeSlot);
        const rePromptText = 'what else would you like to know about upcoming schedule, downtime or picklists?';
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(rePromptText)
            .getResponse();
    }
};

function whatsRunningReply(lineNo, when, timeSlot) {
    
    // Initialise
    let partOne;
    let partTwo;
    let line;
    
    // Standardise inputs and set defaults if not provided by the user, //// LIST ALL MATCHING IF A VARIABLE IS MISSING ??
    if ( typeof(lineNo) === "undefined" ) {
        line = 'One'; // Default to line 1
    } else if ( lineNo === '1' ) {
        line = 'One';
    } else if ( lineNo === '2' || lineNo === 'to' ) {
        line = 'Two';
    } else if ( lineNo === '3' ) {
        line = 'Three';
    } else {
        line = lineNo;
    }
    
    if ( typeof(when) === "undefined" ) {
        partOne = 'today'; // Default to today
        when = 'this';
    } else if ( when === "today" || when === "now" || when === "this" ) {
        partOne = 'today';
        when = 'this';
    } else if ( when === "tomorrow" ) {
        partOne = 'tomorrow';
    }
    
    if ( typeof(timeSlot) === "undefined" ) {
        partTwo = 'am'; // Default to morning
        timeSlot = 'morning';
    } else if (timeSlot === "morning" || timeSlot === "am" ) {
        partTwo = "am";
    } else if (timeSlot === "afternoon" || timeSlot === "pm" || timeSlot === "evening" ) {
        partTwo = "pm";
    }
    
    // Fetch from JSON 
    let toSpeak = '' + Data["schedule"]['line' + line][partOne + '-' + partTwo] + ' is being built on line ' + line + ' ' + when + ' ' + timeSlot;
    
    return speak(toSpeak);
}

const FindDowntimeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FindDowntimeIntent';
    },
    handle(handlerInput) {
        let when     = handlerInput.requestEnvelope.request.intent.slots.when.value;
        let timeSlot = handlerInput.requestEnvelope.request.intent.slots.timeSlot.value;
        
        const speechText = findDowntimeReply(when, timeSlot);
        const rePromptText = 'what else would you like to know about upcoming schedule, downtime or picklists?';
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(rePromptText)
            .getResponse();
    }
};

function findDowntimeReply(when, timeSlot) {
    
    // Initialise
    let partOne;
    let partTwo;
    let isWas = 'is'; // grammar
    
    // Standardise inputs and set defaults if not provided by the user, //// LIST ALL MATCHING IF A VARIABLE IS MISSING ??
    if ( typeof(when) === "undefined" ) {
        partOne = 'today'; // Default to today
        when = 'this'; // grammar
    } else if ( when === "today" || when === "now" || when === "this" ) {
        partOne = 'today';
        when = 'this'; // grammar
    } else if ( when === "tomorrow" ) {
        partOne = 'tomorrow';
    } else if ( when === "yesterday" ) {
        partOne = 'yesterday';
        isWas = 'was';
    }
    
    if ( typeof(timeSlot) === "undefined" ) {
        partTwo = 'am'; // Default to morning
        timeSlot = 'morning';
    } else if (timeSlot === "morning" || timeSlot === "am" ) {
        partTwo = "am";
    } else if (timeSlot === "afternoon" || timeSlot === "pm" || timeSlot === "evening" ) {
        partTwo = "pm";
    }
    
    // Fetch from JSON 
    let downtime = Data["downtime"][partOne + '-' + partTwo];
    let toSpeak;
    
    if (downtime === '') { // No downtime information found
        toSpeak = 'there ' + isWas + ' no downtime scheduled for ' + when + ' ' + timeSlot;
    } else {
        toSpeak = 'there ' + isWas + ' scheduled downtime for ' + downtime + ' ' + when + ' ' + timeSlot;
    }
    
    return speak(toSpeak);
}

const FindPicklistIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FindPicklistIntent';
    },
    handle(handlerInput) {
        let when     = handlerInput.requestEnvelope.request.intent.slots.when.value;
        let timeSlot = handlerInput.requestEnvelope.request.intent.slots.timeSlot.value;
        let lineNo   = handlerInput.requestEnvelope.request.intent.slots.lineNo.value;
        
        const speechText = findPicklistReply(handlerInput, lineNo, when, timeSlot);
        const rePromptText = 'what else would you like to know about upcoming schedule, downtime or picklists?';
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(rePromptText)
            .getResponse();
    }
};

function findPicklistReply(handlerInput, lineNo, when, timeSlot) {
    
    let line;
    let partOne;
    let partTwo;
    
    // Check for required and missing optional values, providing defaults where necessary
    if ( typeof(lineNo) === "undefined" ) { // Line number was not specified (Required)
        return speak('i didnt hear a line number, try asking me whats on the picklist for a line number at a particular time slot');
    } else if (lineNo === '1' || lineNo === 'one' ) {
        line = 'One';
    } else if (lineNo === '2' || lineNo === 'two') {
        line = 'Two';
    } else if (lineNo === '3' || lineNo === 'three' ) {
        line = 'Three';
    } else {
        return speak('that is not a valid line number, try asking me whats on the picklist for line one, two or three at a particular time slot');
    }
    
    // Standardise inputs and set defaults if not provided by the user, //// LIST ALL MATCHING IF A VARIABLE IS MISSING ??
    if ( typeof(when) === "undefined" ) {
        partOne = 'today'; // Default to today
        when = 'this';
    } else if ( when === "today" || when === "now" || when === "this" ) {
        partOne = 'today';
    } else if ( when === "tomorrow" ) {
        partOne = 'tomorrow';
    }
    
    if ( typeof(timeSlot) === "undefined" ) {
        partTwo = 'am'; // Default to morning
        timeSlot = 'morning';
    } else if (timeSlot === "morning" || timeSlot === "am" ) {
        partTwo = "am";
    } else if (timeSlot === "afternoon" || timeSlot === "pm" || timeSlot === "evening" ) {
        partTwo = "pm";
    }
    
    // Fetch from JSON
    let smt = Data["picklist"]['line' + line][partOne + '-' + partTwo]["smt"];
    let conv = Data["picklist"]['line' + line][partOne + '-' + partTwo]["conventional"];
    let consumable = Data["picklist"]['line' + line][partOne + '-' + partTwo]["consumable"];
    
    return speak('The job running on line ' + lineNo + ' ' + when + ' ' + timeSlot + ' requires ' + smt + ' smt parts, ' + conv + ' conventional parts and ' + consumable + ' consumables');
}

function speak(toSpeak) {
     return "<speak>" + toSpeak + "</speak>";
}


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Try asking me whats running on line one tomorrow afternoon, is there any downtime today or whats on the picklist for line one this morning';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'The smart factory skill can\'t help with that but I can help with upcoming schedule, downtime or picklists';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thank you for using the smart factory!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        WhatsRunningIntentHandler,
        FindDowntimeIntentHandler,
        FindPicklistIntentHandler,
        HelpIntentHandler,
        FallbackIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
