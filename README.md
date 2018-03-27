# SWAM speak-chat

StarMash extension to speak chat messages with text to speech.

Reading the chat while getting shot at can be difficult. Having the chat
read aloud gives you one less thing to worry about. 

### Mod Settings
- Enable/disable speech
- Speech speed
- Voice selection for multiple languages (not working in chrome/edge)

## Status
The Web Speech API that runs this extension is still pretty new so
sometimes browser or systems break. Here's the gist: 

- Chromium needs `--enable-speech-dispatcher` when starting
- Safari and IE are untested but may work

If you're using Chromium on linux you may need to install a TTS
engine. If you don't already have espeak do:

```sh
apt-get install espeak
```

All the important things are working but a couple bugs still exist. Pull
requests and new issues are welcome! 