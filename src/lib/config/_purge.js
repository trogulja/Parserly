const { dateConstruct } = require('./common');

const purge = [
  {
    // 20190112 03:00:19.717 PURGING channel 'klz-BACKUP-monthly-purge' delete successfully  '\\srvczg-files\ftp_claro\_BACKUP_KLZ\1_svi_originali\0087ae72-a9c1-4f9a-95ad-690418143019.jpg'
    id: 'p_01',
    act: 'purgeFile',
    desc: 'file delete',
    members: [...dateConstruct, 'channel', 'filepath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PURGING channel '(.+)' delete successfully\s+'(.+)'$/,
  },
  {
    // 20180626 03:00:00.481 PURGING  channel 'cro-00-auto-input-purge3AM' delete empty subfolder successfully '\\srvczg-files\ftp_claro\CRO\auto-IN\Tom'
    id: 'p_02',
    act: 'purgeFolder',
    desc: 'folder delete',
    members: [...dateConstruct, 'channel', 'folderpath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PURGING {2}channel '(.+)' delete empty subfolder successfully\s+'(.+)'\s*$/,
  },
];

module.exports = purge;
