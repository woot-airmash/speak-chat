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

    // NOTE: timeout important because it avoids slowing animations, don't delete
    // queues up the speech call but allows upcoming animations to run first
    setTimeout(function() {
      speechSynthesis.speak(msg);
    }, 1);
  }

  function checkSender (playerNick, message) {
    if (playerNick === game.myName) {
      // don't speak your own message
      return '';
    } else {
      return message;
    }
  }

  function parseChatMessage(player, chatText, chatType) {
    const playerNick = player.name;
    let message;

    switch(chatType) {
      // 0 gen, 2 whisper, 3 team
    case 0:
      message = playerNick + ' says ' + chatText;
      break;
    case 3:
      message = 'in team chat ' + playerNick + ' says ' + chatText;
      break;
    case 2:
      message = 'new whisper ' + playerNick + ' says ' + chatText;
      break;
    default:
      return;
    }

    if (defaultSettings.isSpeechEnabled === true &&
        checkSender(playerNick, message)) {
      speak(message);
    }
  }

  SWAM.on('chatLineAdded', parseChatMessage);

  SWAM.registerExtension({
    name: "chat-speak",
    id: "chat-speak",
    description: "Speaks chat messsages using text to speech",
    author: "woot",
    version: "0.1.0",
    settingsProvider: createSettingsProvider()
  });
}();
