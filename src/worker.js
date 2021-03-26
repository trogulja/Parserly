// const parseFolder = require('./lib/parseFolder');
import parseFolder from './lib/parseFolder';
// import cronParser from 'cron-parser';
import cron from 'node-cron';
import notifier from './lib/util/notifier';

class CronController {
  static cronjob = false;
  static cronjobExecuting = false;

  static init() {
    thisclass = this;
    this.cronjob = cron.schedule(
      '*/5 0,8-23 * * *',
      function() {
        notifier.emit('info', 'Starting cronjob.');
        thisclass.cronjobExecuting = true;
        parseFolder('../_mats/logs/HR').then(() => {
          thisclass.cronjobExecuting = false;
        });
      },
      { scheduled: false }
    );
  }

  static start() {
    if (!this.cronjob) this.init();
    this.cronjob.start();
    notifier.emit('info', 'Crontab started.')
  }

  static stop() {
    if (!this.cronjob) this.init();
    this.cronjob.stop();
    notifier.emit('info', 'Crontab stopped.')
  }

  static destroy() {
    if (this.cronjob) {
      this.cronjob.stop();
      this.cronjob.destroy();
      this.cronjob = false;
      notifier.emit('info', 'Crontab destroyed.');
    }
  }
}

module.exports = CronController;

// parseFolder('../_mats/logs/HR');
