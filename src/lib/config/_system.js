const { dateConstruct } = require('./common');

const system = [
  {
    id: 's_01',
    act: 'ignore',
    desc: 'boot up',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:Claro version|Perpetual license|Importing preferences|Configured color|Concurrent image|Java\(TM\)|java_home|Operating system|Available processors|java\.maxmemory|com\.elpical\.jaimemory|System Info|CPU Vendor|Total System|Deployed|AdminConnector|Starting Inspector|Changed|Daily Backup|New Perpetual|Backup ClaroPref|CPU|Installed updated license|OpenJDK|IspImpl|JobImpl|USERGUI).*$/,
  },
  {
    // 20180514 16:12:35.247 license is Missing
    // 20180514 16:12:35.247 Processing will not be started due to an invalid or missing license
    // 20180514 16:12:35.247 **ERROR Processing will not be started due to an invalid or missing license
    id: 's_02',
    act: 'criticalError',
    desc: 'missing license',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .*(?:license is Miss|Processing will not be started).+$/,
  },
  {
    // 20180517 14:03:29.786 **ERROR1 can not access registry channel:/com/elpical/jclaro/preferences/channel1/ChannelAttributes channelnr:1
    id: 's_03',
    act: 'criticalError',
    desc: 'missing priviledges',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .+ERROR. can not access registry.+$/,
  },
  {
    // 20180522 16:32:46.279 channel 'cro-auto-01-input' : can not create directory: '\\srvczg-files\ftp_claro\CRO\auto-IN'
    id: 's_04',
    act: 'criticalError',
    desc: 'folder access failed',
    members: [...dateConstruct, 'channel', 'folderpath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:WARNING|\*\*ERROR)? ?channel '(.+)' : can not create directory: '(.+)'$/,
  },
  {
    // 20191203 12:43:16.258 Channel 'Copy_of_cro-auto-01-input' removed
    // 20191125 13:53:37.896 Channel 'klz-99-sendToElvis' installed
    // 20191128 15:36:57.747 Channel 'cro-inspectorRoute' is activated
    // 20191128 15:36:57.731 Channel 'cro-inspectorRoute' is set to standby
    // 20210106 00:00:00.046 Channel 'cro-inspectorEdit' Scheduler disables Inspector
    // 20210106 08:00:00.039 Channel 'cro-inspectorEdit' Scheduler enables Inspector
    id: 's_05',
    act: 'ignore',
    desc: 'channel auto setup',
    members: [...dateConstruct, 'channel', 'action'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '.+' (removed|installed|is set to standby|is activated|Scheduler disables Inspector|Scheduler enables Inspector)(?: by schedule)?$/,
    children: [
      {
        // channel can be activated again if cause has been solved.
        id: 's_06',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20180517 14:03:29.880 Channel 'NoName' is set to Standby by user: , remote user:roguljti
    // 20180517 14:03:37.611 Channel 'klz-01-input' is set to Active by user: , remote user:roguljti
    id: 's_07',
    act: 'ignore',
    desc: 'channel manual setup',
    members: [...dateConstruct, 'channel', 'action', 'localUser', 'user'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' (is set to Standby|is set to Active) by user:(.+), remote user:(.+)$/,
  },
  {
    // 20190306 12:46:01.411 Installer download: C:\Program Files\Elpical Claro\jclaroui\claro\installers\ClaroAdmin-11.0.8.exe
    id: 's_08',
    act: 'ignore',
    desc: 'ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Installer download:.+$/,
  },
  {
    // 20190201 14:59:04.864 Delete.deleteFile encountered a problem (Claro will automatically take care of this later on):
    id: 's_09',
    act: 'error',
    desc: 'delete postponed',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Delete\.deleteFile encountered a problem.+$/,
    children: [
      {
        // C:\_claro\KLZ-inputs\klz-01-input-ok\b350fb1d-bb23-47ac-b2a7-7143bb60ba8b.jpg: The process cannot access the file because it is being used by another process.
        // \\srvczg-files\ftp_claro\KLZ\IN\48df90fc-4b16-4644-9e4e-1b5fb8201be7.jpg
        id: 's_10',
        act: 'error',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
      {
        // 20190208 15:47:14.416 channel 'klz-00-inputCheck' file '01dbf913-1aa3-4f07-bd9d-fc1bc5a26e69.jpg' could not be removed from folder(1): \\srvczg-files\ftp_claro\KLZ\IN
        id: 's_11',
        act: 'error',
        desc: 'stuck file',
        members: [...dateConstruct, 'channel', 'filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) channel '(.+)' file '(.+)' could not be removed from folder.*: (.+)$/,
      },
    ],
  },
  {
    // 20181214 14:02:22.597 Encountered a preferences problem... will try to continue processing!
    // 20190201 14:59:04.864 Tried to delete the file: "C:\_claro\KLZ-inputs\klz-01-input-ok\b350fb1d-bb23-47ac-b2a7-7143bb60ba8b.jpg", the original file is: "C:\_claro\KLZ-inputs\klz-01-input-ok\b350fb1d-bb23-47ac-b2a7-7143bb60ba8b.jpg"...
    // 20191128 15:36:57.731 Channel ' set to standby
    id: 's_12',
    act: 'ignore',
    desc: 'ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:Encountered a preferences problem|Tried to delete the file|Channel ' set to standby).*$/,
  },
  {
    // 20190228 15:45:40.637 Claro has now deleted the previously obstructed file:
    id: 's_13',
    act: 'ignore',
    desc: 'delete resolve',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Claro has now deleted the previously obstructed file.+$/,
    children: [
      {
        // "C:\_claro\KLZ-inputs\klz-01-input-ok\665d5262-94d1-435c-8184-9ba17777169e.jpg"
        id: 's_14',
        act: 'ignore',
        desc: 'attached extra info - fullpath',
        members: ['filepath'],
        match: /"(.+)"$/,
      },
      {
        // after 1551365137 milliseconds.
        id: 's_15',
        act: 'ignore',
        desc: 'attached extra info - time',
        members: ['durationMS'],
        match: /after (\d+) milliseconds\.$/,
      },
      {
        id: 's_16',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20190722 10:20:59.819 Failed to delete the file (1): \\srvczg-files\ftp_claro\KLZ\IN\b2045f6b-e8cc-42ec-b3da-5d7ace06df83.jpg
    id: 's_17',
    act: 'error',
    desc: 'failed to delete file',
    members: [...dateConstruct, 'filepath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Failed to delete the file \(\d+\): (.+)$/,
  },
  {
    // 20200226 07:58:19.714 java.io.FileNotFoundException: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Stmk_IN\MUZE_JUBG_0227_60_X.pdf (Access is denied)
    // 20191127 15:36:45.740 java.io.FileNotFoundException: \\srvczg-files\ftp_claro\KLZ\IN\0849512c-6dce-4caf-9fb0-561cc70f68cf.jpg (The process cannot access the file because it is being used by another process)Routing doJob FileCopy f1 failed (form: \\srvczg-files\ftp_claro\KLZ\IN\0849512c-6dce-4caf-9fb0-561cc70f68cf.jpg to: \\srvczg-files\ftp_claro\_BACKUP_KLZ\1_svi_originali\0849512c-6dce-4caf-9fb0-561cc70f68cf.jpg)
    // 20191127 15:36:45.740 java.io.FileNotFoundException: \\srvczg-files\ftp_claro\KLZ\IN\0849512c-6dce-4caf-9fb0-561cc70f68cf.jpg (The process cannot access the file because it is being used by another process) Routing copyImageToBadFolder failed
    // 20200224 10:02:06.335 Exception: java.io.FileNotFoundException: C:\Program Files\Elpical Claro\work_pdf16\EISE_STAD_0226_24_X.xml (The requested operation cannot be performed on a file with a user-mapped section open)
    // 20200224 09:57:45.616 ClaroPDF readPdfXmlFile 1: java.io.FileNotFoundException: C:\Program Files\Elpical Claro\work_pdf16\MATT_BURG_0226_32_X.xml (The system cannot find the file specified)
    // 20200224 09:57:45.616 ClaroPDF readPdfXmlFile 4: java.io.FileNotFoundException: C:\Program Files\Elpical Claro\work_pdf16\MATT_BURG_0226_32_X.xml (The system cannot find the file specified)
    id: 's_18',
    act: 'criticalError',
    desc: 'file access failed',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:Exception: |ClaroPDF readPdfXmlFile \d+: )?java\.io\.FileNotFoundException.+$/,
  },
  {
    // 20200214 09:45:07.473 Delete.deleteV2(\\srvsgr-clf02\PR\Anzred1\GUTGEMACHT.AT\00_Automatische Bildbearbeitung\01_zu bearbeiten\Thumbs.db) failed: java.nio.file.FileSystemException: \\srvsgr-clf02\PR\Anzred1\GUTGEMACHT.AT\00_Automatische Bildbearbeitung\01_zu bearbeiten\Thumbs.db: The process cannot access the file because it is being used by another process.
    id: 's_19',
    act: 'criticalError',
    desc: 'file is locked error',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Delete.deleteV2.+failed: java\.nio\.file\.FileSystemException.+$/,
    children: [
      {
        // , reason: (unknown)
        id: 's_32',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20190802 15:00:54.917 Delete.deleteV2 was not able to remove the file: C:\Program Files\Elpical Claro\tmp\12-big-GSJ760PZXV_Food_DID Door Open2.psd.icc
    id: 's_20',
    act: 'error',
    desc: 'delete postponed',
    members: [...dateConstruct, 'filepath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Delete.deleteV2 was not able to remove the file: (.+)$/,
  },
  {
    // 20191228 11:47:43.261 PrefChannel.channelprefs_base: Exception
    id: 's_21',
    act: 'ignore',
    desc: 'prefchannel error',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PrefChannel\.channelprefs_base: Exception$/,
  },
  {
    // 20200103 14:26:47.234 **ERROR Installed updated license. If new options have been added you might need to restart for enabling these options.
    id: 's_22',
    act: 'ignore',
    desc: 'licence warning',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .*ERROR Installed updated license.+$/,
  },
  {
    // 20200110 15:21:56.112 **ERROR  concurrent processes (6 > 4) are not valid for this license, please inform distributor about license conditions
    id: 's_23',
    act: 'criticalError',
    desc: 'bad configuration',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .*ERROR\s+concurrent processes .+ are not valid for this license.+$/,
    children: [
      {
        //    maximum concurrent processed limitted to: 4
        id: 's_24',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20200103 15:37:32.186 Error PdfLoader.refersToSamePDF:
    id: 's_25',
    act: 'criticalError',
    desc: 'pdf loader error',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Error PdfLoader\.refersToSamePDF.+$/,
    children: [
      {
        // threadid = 54
        // xmlFile = C:\Program Files\Elpical Claro\work_pdf17\SUWO_VOIT_0108_02_X-19.xml
        // xmlFile length = 22981
        // pdfFile = \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Stmk_IN\SUWO_VOIT_0108_02_X.pdf
        // file 'SUWO_VOIT_0108_02_X-19.xml' copied to folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Stmk_ERROR
        id: 's_26',
        act: 'criticalError',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20200220 10:16:32.454 **ERROR illegal from adress specified in system parameters:Illegal address
    // 20200220 10:16:32.454 **ERROR failure send by email failed
    id: 's_27',
    act: 'criticalError',
    desc: 'email failed',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .*ERROR (?:illegal from adress|failure send by email).+$/,
  },
  {
    id: 's_28',
    act: 'ignore',
    desc: 'unknown content type error',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Nicht .+$/,
  },
  {
    id: 's_29',
    act: 'ignore',
    desc: 'licence state OK',
    members: [],
    match: /Valid for version.+$/,
  },
  {
    // jvm 1    | java.io.FileNotFoundException: \\srvczg-files\ftp_claro\CRO\IN\PXL_270121_31598232.jpg (The process cannot access the file because it is being used by another process)
    id: 's_30',
    act: 'criticalError',
    desc: 'file used by another proc',
    members: ['filepath', 'reason'],
    match: /java\.io\.FileNotFoundException: (.+) \((.+)\)$/,
    children: [
      {
        // jvm 1    | 	at java.base/java.io.RandomAccessFile.open0(Native Method)
        // jvm 1    | 	at java.base/java.io.RandomAccessFile.open(Unknown Source)
        // jvm 1    | 	at java.base/java.io.RandomAccessFile.<init>(Unknown Source)
        // jvm 1    | 	at java.base/java.io.RandomAccessFile.<init>(Unknown Source)
        // jvm 1    | 	at java.base/java.io.RandomAccessFile.<init>(Unknown Source)
        // jvm 1    | 	at com.elpical.io.readers.FileFormatReader.read(FileFormatReader.java:222)
        // jvm 1    | 	at com.elpical.io.readers.ImageReader.a(ImageReader.java:73)
        // jvm 1    | 	at com.elpical.io.readers.ImageReader.<init>(ImageReader.java:69)
        // jvm 1    | 	at com.elpical.jclaro.channel.Channel.a(Unknown Source)
        // jvm 1    | 	at com.elpical.jclaro.channel.Channel.a(Unknown Source)
        // jvm 1    | 	at l4.a(Unknown Source)
        // jvm 1    | 	at l4.run(Unknown Source)
        id: 's_31',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // 20200224 14:55:21.362 Error Scanning folder:
    id: 's_33',
    act: 'criticalError',
    desc: 'error scanning folder',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Error Scanning folder.*$/,
    children: [
      {
        // 20200224 14:55:21.362 Folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Stmk_IN
        id: 's_34',
        act: 'criticalError',
        desc: 'error scanning folder location',
        members: [...dateConstruct, 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Folder: (.*)$/,
      },
      {
        // 20200224 14:55:21.362 java.util.ConcurrentModificationException
        id: 's_35',
        act: 'criticalError',
        desc: 'error scanning folder msg',
        members: [...dateConstruct],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) java\.util\.ConcurrentModificationException.*$/,
      },
    ],
  },
  {
    // 20200224 13:42:38.453 in jobfile 'C:\Program Files\Elpical Claro\work_pdf16\KAWO_LAVA_0226_63_X.xml' unknown format
    id: 's_36',
    act: 'error',
    desc: 'malformed xml',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) in jobfile '(.+)' unknown format$/,
    children: [
      {
        // 20200224 13:42:38.454 [com.elpical.jclaro.channel.ClaroBad.a(Unknown Source), com.elpical.jclaro.channel.ClaroBad.a(Unknown Source), com.elpical.jclaro.channel.Channel.a(Unknown Source), ka.a(Unknown Source), ka.run(Unknown Source)]
        id: 's_37',
        act: 'ignore',
        desc: 'error ignore',
        members: [...dateConstruct],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \[.+ClaroBad.+$/,
      },
      {
        // 20200224 13:42:38.471 file 'KAWO_LAVA_0226_63_X.xml' copied to folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_ERROR
        id: 's_38',
        act: 'errorResolve',
        desc: 'error resolve',
        members: ['filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) file '(.+)' copied to folder: (.+)$/,
      },
    ],
  },
  {
    // jvm 8    | [Fatal Error] :776:45: XML document structures must start and end within the same entity.
    id: 's_39',
    act: 'ignore',
    desc: 'verbose error in log2',
    members: ['error'],
    match: /\[Fatal Error\] (.+)$/,
    children: [
      {
        // jvm 8    | Inspector retries processing on file:9965.job, tst = 19
        id: 's_40',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // jvm 8    | com.elpical.io.readers.DecodingException: No JPEG library found
    id: 's_41',
    act: 'ignore',
    desc: 'no jpeg library found',
    members: [],
    match: /com\.elpical\.io\.readers\.DecodingException: .+$/,
    children: [
      {
        // jvm 8    | 	at com.elpical.io.readers.jpeg.JpegLoader.load(JpegLoader.java:242)
        id: 's_42',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // jvm 8    | com.elpical.jclaro.channel.OverSizedException: imagesize exceeds maximum imagesize(63443250 pixel > 50 Mpixel)
    id: 's_43',
    act: 'ignore',
    desc: 'image size exceeds max',
    members: [],
    match: /com\.elpical\.jclaro\.channel\.OverSizedException: .+$/,
    children: [
      {
        // jvm 8    | 	at lj.a(Unknown Source)
        id: 's_44',
        act: 'ignore',
        desc: 'attached extra info',
        members: [],
        match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
      },
    ],
  },
  {
    // jvm 8    | com.adobe.xmp.XMPException: XML parsing failure error reading jpeg xmp:XML parsing failure
    id: 's_45',
    act: 'ignore',
    desc: 'metadata error',
    members: [],
    match: /com\.adobe\.xmp\.XMPException: XML parsing failure error .+$/,
  },
  {
    // jvm 1    | XML (C:\Program Files\Elpical Claro\inspector\claro\aboutrejects\1547) contains invalid character, STRIP:&#
    id: 's_46',
    act: 'ignore',
    desc: 'metadata error',
    members: [],
    match: /XML \(.+\) contains invalid character.+$/
  },
  {
    // jvm 3    | OpenCV Error: Assertion failed (0 <= _colRange.start && _colRange.start <= _colRange.end && _colRange.end <= m.cols) in cv::Mat::Mat, file C:\builds\master_PackSlaveAddon-win64-vc12-static\opencv\modules\core\src\matrix.cpp, line 464
    id: 's_47',
    act: 'ignore',
    desc: 'no idea what this is',
    members: [],
    match: /OpenCV Error: .+$/
  }
];

module.exports = system;
