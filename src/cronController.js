// const parseFolder = require('./lib/parseFolder');
import parseFolder from './lib/parseFolder';
// import cronParser from 'cron-parser';
import cron from 'node-cron';
import notifier from './lib/util/notifier';
import paths from './lib/util/pathHandler';
import path from 'path';

class CronController {
  constructor() {
    this.cronjob = false;
    this.cronjobExecuting = false;
    this.folder = paths.logs;
    // TODO - programatically choose where to parse from!
    this.target = path.join(paths.db, this.folder);

    this.cronPayload = async () => {
      if (this.cronjobExecuting) {
        notifier.log({ event: 'warn', text: 'Parser is already running, aborting cronjob.', meta: { job: 'cron', status: 'run abort' } });
        return false;
      }
      notifier.log({ event: 'info', text: 'Running scheduled cronjob.', meta: { job: 'cron', status: 'run' } });
      this.cronjobExecuting = true;
      await parseFolder(this.target);
      this.cronjobExecuting = false;
    };

    this.cronjob = cron.schedule('*/5 0,8-23 * * *', this.cronPayload, { scheduled: false });
  }

  start() {
    this.cronjob.start();
    notifier.log({ event: 'info', text: 'Crontab started.', meta: { job: 'cron', status: 'start' } });
  }

  async forceStart() {
    if (this.cronjobExecuting) {
      notifier.log({ event: 'warn', text: 'Parser is already running, aborting forceStart.', meta: { job: 'cron', status: 'forceStart abort' } });
      return false;
    }
    notifier.log({ event: 'info', text: 'Manually running parser.', meta: { job: 'cron', status: 'forceStart' } });
    this.cronjobExecuting = true;
    await parseFolder(this.target);
    this.cronjobExecuting = false;
    notifier.log({ event: 'info', text: 'Completed manual parser run.', meta: { job: 'cron', status: 'forceStart complete' } });
    return true;
  }

  stop() {
    this.cronjob.stop();
    notifier.log({ event: 'info', text: 'Crontab stopped.', meta: { job: 'cron', status: 'stop' } });
  }

  destroy() {
    if (this.cronjob) {
      this.cronjob.stop();
      this.cronjob.destroy();
      this.cronjob = false;
      notifier.log({ event: 'info', text: 'Crontab destroyed.', meta: { job: 'cron', status: 'destroy' } });
    }
  }

  create() {
    if (this.cronjob) this.destroy();

    this.cronjob = cron.schedule('*/5 0,8-23 * * *', this.cronPayload, { scheduled: false });
    notifier.log({ event: 'info', text: 'Crontab created.', meta: { job: 'cron', status: 'created' } });
  }
}

export default new CronController();

// parseFolder('../_mats/logs/HR');
