class MessageHandler {
  constructor(win) {
    this.win = win.webContents;
  }

  log(message) {
    return this.win.send('log', message);
  }

  debug(message) {
    return this.win.send('debug', message);
  }

  progress(message) {
    return this.win.send('progress', message);
  }
}

export default MessageHandler;
