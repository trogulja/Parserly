const { dateConstruct } = require('./common');

const route = [
  {
    // 20190112 09:59:44.365 Channel 'klz-00-inputCheck' routing file: fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg
    id: 'r_01',
    act: 'startRoute',
    desc: 'start',
    members: [...dateConstruct, 'channel', 'filename'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' routing file:\s+(.+)$/,
    children: [
      {
        // 20190112 09:59:44.386 file 'fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg' copied to folder: C:\_claro\KLZ-inputs\klz-01-input-ok
        id: 'r_02',
        act: 'endRoute',
        desc: 'done',
        members: [...dateConstruct, 'filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) file '(.+)' copied to folder:\s+(.+)$/,
      },
      {
        // 20180523 17:37:00.316 file 'hrvatska_ladic.jpg' can not be copied to folder: \\srvczg-files\ftp_claro\CRO\OUT\kreso
        // jvm 8    | 20210117 14:23:30.810 tst = 0, file 'PXL_170121_31471371.jpg' can not be copied to (1): \\srvczg-files\ftp_claro\CRO\OUT\seckinat
        id: 'r_03',
        act: 'error',
        desc: 'error1',
        members: [...dateConstruct, 'filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:tst = 0, )?file '(.+)' can not be copied to(?: folder| \(\d+\))?: (.+)$/,
      },
      {
        // reason:there is already a file with the same name. Wait max. for: 60 sec.
        id: 'r_04',
        act: 'ignore',
        desc: 'ignore',
        members: [],
        match: /reason:there is already a file with the same name.+$/,
      },
      {
        // 20180616 19:20:04.550 file'KB_str_87_do_95 (1).pdf' can not be routed on image properties
        // jvm 1    | 20210126 09:19:36.613 **ERROR file'Kvizoteka14.pdf' can not be routed on image properties
        id: 'r_05',
        act: 'error',
        desc: 'error2',
        members: [...dateConstruct, 'filename'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )?file\s*'(.+)' can not be routed on image properties$/,
      },
      {
        // 20180523 17:38:00.645 file 'hrvatska_ladic.jpg' copied to '\\srvczg-files\ftp_claro\CRO\ERROR
        id: 'r_06',
        act: 'errorResolve',
        desc: 'error resolve',
        members: [...dateConstruct, 'filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) file '(.+)' copied to '(.+)$/,
      },
      {
        // jvm 1    | 20210123 11:22:00.765 WARNING file 'Prometna velika gorica (3).jpg' can not be copied to folder: \\srvczg-files\ftp_claro\CRO\OUT\bikickre
        // jvm 1    | 20210123 11:23:00.989 **ERROR tst = 0, file 'Prometna velika gorica (3).jpg' can not be copied to (1): \\srvczg-files\ftp_claro\CRO\OUT\bikickre
        id: 'r_07',
        act: 'error',
        desc: 'name collision',
        members: [...dateConstruct, 'filename'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) WARNING file '(.+)' can not be copied to folder: .+$/,
        children: [
          {
            // jvm 1    | reason:there is already a file with the same name. Wait max. for: 60 sec.
            id: 'r_08',
            act: 'ignore',
            desc: 'extra info',
            members: [],
            match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
          },
          {
            id: 'r_09',
            act: 'ignore',
            desc: 'extra info',
            members: ['filename', 'folderpath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ..ERROR tst = \d+, file '(.+)' can not be copied to .+: (.+)$/,
          },
        ],
      },
    ],
  },
];

module.exports = route;
