// const parseFolder = require('./lib/parseFolder');
import parseFolder from './lib/parseFolder';
// import cronParser from 'cron-parser';
import cron from 'node-cron';
import notifier from './lib/util/notifier';
import paths from './lib/util/pathHandler';
import path from 'path';

class CronController {
  static cronjob = false;
  static cronjobExecuting = false;

  static init() {
    const thisclass = this;
    this.cronjob = cron.schedule(
      '*/5 0,8-23 * * *',
      function() {
        notifier.emit('log', { event: 'info', text: 'Running scheduled cronjob.', meta: { job: 'cron', status: 'run' } });
        thisclass.cronjobExecuting = true;
        // TODO - programatically choose where to parse from!
        parseFolder(path.join(paths.db, '../_mats/logs/HR')).then(() => {
          thisclass.cronjobExecuting = false;
        });
      },
      { scheduled: false }
    );
  }

  static start() {
    if (!this.cronjob) this.init();
    this.cronjob.start();
    notifier.emit('log', { event: 'info', text: 'Crontab started.', meta: { job: 'cron', status: 'start' } });
  }

  static stop() {
    if (!this.cronjob) this.init();
    this.cronjob.stop();
    notifier.emit('log', { event: 'info', text: 'Crontab stopped.', meta: { job: 'cron', status: 'stop' } });
  }

  static destroy() {
    if (this.cronjob) {
      this.cronjob.stop();
      this.cronjob.destroy();
      this.cronjob = false;
      notifier.emit('log', { event: 'info', text: 'Crontab destroyed.', meta: { job: 'cron', status: 'destroy' } });
    }
  }
}

export default CronController;

// parseFolder('../_mats/logs/HR');
