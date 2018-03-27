!function(){

  let defaultSettings = {
    isSpeechEnabled: true,
    speechRate: 5,
    speechVoice: ''
  };

  const isChrome = /chrome/i.test(navigator.userAgent);
  const isEdge = /edge/i.test(navigator.userAgent);
  const isAsyncBrowser = (isChrome || isEdge);

  function getVoices() {
    let voices = speechSynthesis.getVoices();
    return voices.reduce((acc, voice) => {
      acc[voice.name] = voice.name;
      return acc;
    }, {});
  }

  function loadVoices() {
    return new Promise((resolve) => {
      if (isAsyncBrowser) {
        // chrome/edge have to load asynchronously with this event handler
        speechSynthesis.onvoiceschanged = function() {
          const voiceList = getVoices();
          resolve(voiceList);
        };
      } else {
        const voiceList = getVoices();
        resolve(voiceList);
      }
    });
  }

  function settingsApplied(values) {
    // retrieve the speechSynthesis voice object matching the selected voice
    const choosenVoice = values.speechVoice;
    const voice = speechSynthesis.getVoices().filter(voice => {
      return voice.name === choosenVoice;
    })[0];

    values.speechVoice = voice;
    defaultSettings = values;
  }

  function createSettingsProvider() {
    const sp = new SettingsProvider(defaultSettings, settingsApplied);
    const section = sp.addSection('First Section');

    section.addBoolean('isSpeechEnabled', 'Enable speech');
    section.addSliderField('speechRate', 'Voice speed',
                           {
                             min: 1,
                             max: 11, // :D
                             step: 1
                           });

    loadVoices().then(voiceList => {
      section.addValuesField('speechVoice', 'Voice language (Blank is English or unsupported by your browser)', voiceList);
    });

    return sp;
  }

  // speak a string of text with tts
  function speak (text) {
    const msg = new SpeechSynthesisUtterance(text);
    // keep the speech rate between 1-2 (most usable speeds)
    msg.rate = 0.9 + defaultSettings.speechRate / 10;

    if (defaultSettings.speechVoice !== '') {
      msg.voice = defaultSettings.speechVoice;
    }

    speechSynthesis.speak(msg);
  }

  function checkSender (playerNick, message) {
    if (playerNick === game.myName) {
      // don't speak your own message
      return '';
    } else {
      return message;
    }
  }

  function generalMessge(nodes) {
    const playerNick = nodes[0].children[1].innerText;
    const chatText =  nodes[1].innerText;
    const message = 'in team chat ' + playerNick + ' says ' + chatText;
    return checkSender(playerNick, message);
  }

  function teamMessage(nodes) {
    const playerNick = nodes[1].children[0].innerText;
    const chatText =  nodes[2].innerText;
    const message= 'in team chat ' + playerNick + ' says ' + chatText;
    return checkSender(playerNick, message);
  }

  function whisperMessage(nodes) {
    const playerNick = nodes[1].children[0].innerText;
    const chatText =  nodes[2].innerText;
    const message = 'new whisper ' + playerNick + ' says ' + chatText;
    return checkSender(playerNick, message);
  }

  // run when new chat messages appear, reads their text content
  function parseChatMessage(chatElementsArray) {
    const chatLength = chatElementsArray.length - 1;
    const parentEl = chatElementsArray[chatLength];
    const childNodes = parentEl.addedNodes[0].children;
    const chatCSS = childNodes[0].className;

    let message;

    if (/playersel/.test(chatCSS)) {
      message = generalMessge(childNodes);
    } else if (/team/.test(chatCSS)) {
      message = teamMessage(childNodes);
    } else if (/whisper/.test(chatCSS)) {
      message = whisperMessage(childNodes);
    } else {
      return;
    }

    if (defaultSettings.isSpeechEnabled === true) {
      speak(message);
    }
  }

  let OBSERVER;

  function startObserver() {
    const chatbox = $('#chatlines')[0];
    const config = { childList: true };
    OBSERVER = new MutationObserver(parseChatMessage);
    OBSERVER.observe(chatbox, config);
  }

  // set the mutation observer to watch chat messages
  SWAM.on('gamePrep', function() {
    // give time for DOM to render
    setTimeout(function() {
      startObserver();
    }, 1000);
  });

  SWAM.on('gameWipe', function() {
    // clean up observer when disconnecting
    if (OBSERVER != null) {
      OBSERVER.disconnect();
    }
  });

  SWAM.registerExtension({
    name: "chat-speak",
    id: "chat-speak",
    description: "Speaks chat messsages using text to speech",
    author: "woot",
    version: "0.1.0",
    settingsProvider: createSettingsProvider()
  });
}();
