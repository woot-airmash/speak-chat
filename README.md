# SWAM speak-chat

StarMash extension to speak chat messages with text to speech.

Reading the chat while getting shot at can be difficult. Having the chat
read aloud gives you one less thing to worry about. 

Install URL: `https://cdn.jsdelivr.net/npm/speak-chat@0.1.0/speak-chat.js`

### Mod Settings
- Enable/disable speech
- Speech speed
- Voice selection for multiple languages

## Status
The Web Speech API that runs this extension is still pretty new so
sometimes browsers or systems break. Here's the gist: 

- Chromium needs `--enable-speech-dispatcher` when starting
- Safari and IE are untested but may work

If you're using Chromium on linux you may need to install a TTS
engine. If you don't already have espeak do:

```sh
apt-get install espeak
```

Pull requests and new issues are welcome! 