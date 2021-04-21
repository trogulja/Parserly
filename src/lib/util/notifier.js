const EventEmitter = require('events');
// const notifier = new EventEmitter();
// module.exports = notifier;

/** logMessage
 * Message used to communicate between backend and frontend
 * @typedef {Object} logMessage
 * @property {string} event event type: debug, progress, info, warn, error
 * @property {string} time time value in hh:mm:ss format
 * @property {string} text message that will be shown to the user
 * @property {Object} meta key value pairs describing this event (for jobs)
 * @property {string} meta.job name of the job this refers to
 * @property {string} meta.status what is happening with this job
 */

class Notifier extends EventEmitter {
  getTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
    const seconds = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
  }

  /** log(message)
   * Send information to renderer process:
   * - debug - verbose information for debugging purposes, shown in console.log
   * - progress - current job percentage
   * - info - general overview about what's going on in the back
   * - warn - handled errors or events we worry about
   * - error - cought errors
   * @param {logMessage} message message we are sending to renderer proc
   */
  log(message) {
    const time = this.getTime();
    console.log(`[${time}] ${message.event}: ${message.text}`);
    return this.emit('log', { time, ...message });
  }

  debug(message) {
    const time = this.getTime();
    console.log(`DEBUG [${time}] ${message.event}: ${message.text}`);
    return this.emit('debug', { time, ...message });
  }

  progress(message) {
    const time = this.getTime();
    // console.log(`PROGRESS [${time}] ${message.event}: ${message.text}`);
    // TODO - figure out if we can replace process.stdout with something else
    // process.stdout.write(`[${time}] ${message.event}: ${message.text}\x1b[0G`);
    return this.emit('progress', { time, ...message });
  }
}

const notifier = new Notifier();
export default notifier;
