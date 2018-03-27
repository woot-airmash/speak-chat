!function(){

  let defaultSettings = {
    isSpeechEnabled: true,
    speechRate: 5,
    speechVoice: ''
  };


  function loadVoices() {
    // invoking getVoices loads speech asynchronously in chrome and edge
    const voices = speechSynthesis.getVoices();
    return voices.reduce((acc, voice) => {
      acc[voice.name] = voice.name;
      return acc;
    }, {});
  }

  // for chrome and edge support
  window.speechSynthesis.onvoiceschanged = loadVoices;

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

    // FIXME: voices in chrome don't get loaded properly
    const voiceList = loadVoices();
    section.addValuesField('speechVoice', 'Voice language (Blank is English or unsupported by your browser)', voiceList);

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

  function generalMessge(nodes) {
    const playerNick = nodes[0].children[1].innerText;
    const chatText =  nodes[1].innerText;
    return playerNick + ' says ' + chatText;
  }

  function teamMessage(nodes) {
    const playerNick = nodes[1].children[0].innerText;
    const chatText =  nodes[2].innerText;
    return 'in team chat ' + playerNick + ' says ' + chatText;
  }

  function whisperMessage(nodes) {
    const playerNick = nodes[1].children[0].innerText;
    const chatText =  nodes[2].innerText;
    return 'new whisper ' + playerNick + ' says ' + chatText;
  }

  // run when new chat messages appear, reads their text content
  function mutationCallback(mutationList) {
    const parentEl = mutationList[1] || mutationList[0];
    const nodes = parentEl.addedNodes[0].children;
    const chatCSS = nodes[0].className;

    let message;

    if (/playersel/.test(chatCSS)) {
      message = generalMessge(nodes);
    } else if (/team/.test(chatCSS)) {
      message = teamMessage(nodes);
    } else if (/whisper/.test(chatCSS)) {
      message = whisperMessage(nodes);
    } else {
      return;
    }

    speak(message);
  }

  function startObserver() {
    const chatbox = $('#chatlines')[0];
    const config = { childList: true };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(chatbox, config);
  }

  // set the mutation observer to watch chat messages
  SWAM.on('gamePrep', function() {
    if (defaultSettings.isSpeechEnabled === true) {
      // give time for DOM to render
      setTimeout(function() {
        startObserver();
      }, 1000);
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
