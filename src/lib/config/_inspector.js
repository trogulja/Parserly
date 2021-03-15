const { dateConstruct } = require('./common');

const inspector = [
  {
    // 20180805 19:32:34.067 in transforming colorspace:java.io.IOException: Cannot open file C:\Program Files\Elpical Claro\tmp\9309dfb3-621a-4e59-b2ee-cbe3354c6343.jpg.icc, converting to working profile:C:\Program Files\Elpical Claro\tmp\9309dfb3-621a-4e59-b2ee-cbe3354c6343.jpg.icc
    id: 'i_01',
    act: 'ignore',
    desc: 'error ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) in transforming colorspace.+$/,
  },
  {
    // 20180801 16:51:37.619 Couldn't create SOAP message due to exception: org.jvnet.mimepull.MIMEParsingException: org.eclipse.jetty.io.EofException: Early EOF
    // jvm 1    | 20210212 10:30:41.668 **ERROR Couldn't create SOAP message due to exception: org.jvnet.mimepull.MIMEParsingException: java.io.IOException: java.util.concurrent.TimeoutException: Idle timeout expired: 120002/120000 ms
    id: 'i_03',
    act: 'ignore',
    desc: 'error ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )?Couldn't create SOAP message.+$/,
  },
  {
    // 20180723 15:11:00.752 ***ERROR1 Queue ID 4680 does not exist
    // 20180523 16:42:46.946 ***ERROR2 Queue ID 139 does not exist
    id: 'i_04',
    act: 'ignore',
    desc: 'error ignore',
    members: [...dateConstruct, 'inspectID'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) .+ERROR.+ Queue ID (\d+) does not exist$/,
  },
  {
    // 20180702 13:26:26.496 caught throwable
    id: 'i_05',
    act: 'ignore',
    desc: 'error ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) caught throwable$/,
  },
  {
    // 20180910 20:29:20.821 Object '6395' is already in use by :preberbo on server SRVCZG-PAMENDO
    id: 'i_06',
    act: 'ignore',
    desc: 'error ignore',
    members: [...dateConstruct, 'inspectID', 'user'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Object '(.+)' is already in use by :(.+) on server .+$/,
  },
  {
    // 20180806 15:24:15.666 INSPECT Original and/or procssed file do not exist for Inspector for job: 7565,  removing jobfile now
    id: 'i_07',
    act: 'ignore',
    desc: 'end error',
    members: [...dateConstruct, 'inspectID'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) INSPECT Original and\/or procssed file do not exist for Inspector for job: (\d+).+$/,
  },
  {
    // 20200217 18:00:24.764 INSPECT Original file does not exist for Inspector for job: 11951, originalFile = C:\Program Files\Elpical Claro\inspector\claro\rejected\shutterstock_1059640043.jpg,  removing jobfile now
    // jvm 2    | 20210221 12:52:22.983 **ERROR INSPECT Original file does not exist for Inspector for job: 2070, originalFile = C:\Program Files\Elpical Claro\inspector\claro\rejected\PXL_230419_24374343.jpg,  removing jobfile now
    id: 'i_08',
    act: 'ignore',
    desc: 'end error',
    members: [...dateConstruct, 'inspectID', 'filepath'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )?INSPECT Original file does not exist for Inspector for job: (\d+), originalFile = (.+),  removing jobfile now$/,
  },
  {
    // 20180812 13:16:55.653 CONVERT profile  sRGB IEC61966-2.1 (Perceptual rendering intent)
    // 20181119 13:20:51.496 CONVERT EMBED profile  ISOnewspaper26v4.icc (Perceptual rendering intent)
    id: 'i_02',
    act: 'ignore',
    desc: 'error resolve',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) CONVERT .+$/,
  },
  {
    // 20180517 16:34:51.547 INSPECT UserName: roguljti ImageName: 0cf9f54e-82d4-41dc-b353-a0755c27dc92.jpg(68) InspectorChannel: cro-inspectorEdit Action: Use Processed
    // 20190112 11:26:20.635 INSPECT UserName: barlekde ImageName: 80e9fd39-e62d-42e0-8f97-0b2759a23b77.jpg(2) InspectorChannel: klz-inspectorEdit Action: Use Processed PStime:78 sec.
    id: 'i_09',
    act: 'inspected',
    desc: 'end resolve',
    members: [...dateConstruct, 'user', 'filename', 'inspectID', 'channel', 'inspectAction', 'inspectDuration'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) INSPECT UserName: (.+) ImageName: (.+)\((\d+)\) InspectorChannel: (.+) Action: ([\w ]+)(?: PStime:(\d+) sec\.)?$/,
    children: [
      {
        // 20180812 13:16:55.653 CONVERT profile  sRGB IEC61966-2.1 (Perceptual rendering intent)
        // 20181119 13:20:51.496 CONVERT EMBED profile  ISOnewspaper26v4.icc (Perceptual rendering intent)
        id: 'i_15',
        act: 'ignore',
        desc: 'error resolve',
        members: [...dateConstruct],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) CONVERT .+$/,
      },
      {
        // 20190520 15:52:43.579 getChannelImage EXCEPTION:com.elpical.io.readers.DecodingException: Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\20632.tiffTIF), cause:The input profile is not suitable for the colorspace of the image msg:Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\20632.tiffTIF), cause:The input profile is not suitable for the colorspace of the image TST:12
        id: 'i_11',
        act: 'error',
        desc: 'warning',
        members: [...dateConstruct, 'error'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) getChannelImage (EXCEPTION:com\.elpical.+)$/,
      },
      {
        // 20190520 15:52:43.583 during import file '20632.tiffTIF', cause : Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\20632.tiffTIF), cause:The input profile is not suitable for the colorspace of the image
        id: 'i_12',
        act: 'errorResolve',
        desc: 'error resolve',
        members: [...dateConstruct, 'filename'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:error )?during import file '(.+)', cause : .+$/,
      },
      {
        // 20190520 15:52:43.586 Channel 'cro-inspectorEdit' file 'KOSCI-1-1.tiff' can not be managed by inspector, reason:Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\20632.tiffTIF), cause:The input profile is not suitable for the colorspace of the image
        id: 'i_13',
        act: 'error',
        desc: 'inspector send error',
        members: [...dateConstruct, 'channel', 'filename'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' file '(.+)' can not be managed by inspector.+$/,
      },
      {
        // 20190520 15:52:43.595 , file 'KOSCI-1-1.tiffTIF' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
        id: 'i_14',
        act: 'errorResolve',
        desc: 'inspector send error resolve',
        members: [...dateConstruct, 'filename', 'folderpath'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) , file '(.+)' copied to folder: (.+)$/,
      },
    ],
  },
  {
    // 20190112 11:26:21.098 Channel 'klz-inspectorEdit'  inspected file: 80e9fd39-e62d-42e0-8f97-0b2759a23b77.jpg
    id: 'i_10',
    act: 'ignore',
    desc: 'end confirmation',
    members: [...dateConstruct, 'channel', 'filename'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)'\s+ inspected file: (.+)$/,
  },
  {
    // jvm 8    | 20210119 13:55:08.627 Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\5774.JPG), cause:The input profile is not suitable for the colorspace of the image
    // jvm 1    | 20210201 16:10:30.434 **ERROR Error transforming colorspace(\\srvczg-files\ftp_claro\CRO\IN\caitcannes3.jpg), cause:The input profile is not suitable for the colorspace of the image
    id: 'i_16',
    act: 'ignore',
    desc: 'color profile transform error',
    members: [...dateConstruct, 'filepath', 'error'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )?Error transforming colorspace\((.+)\), cause:(.+)$/,
  },
  {
    // jvm 1    | 20210203 16:15:55.369 Released Inspector job: 5518. Job was in use for: 60 minutes.
    id: 'i_17',
    act: 'ignore',
    desc: 'inspect job timeout',
    members: [...dateConstruct, 'inspectID'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Released Inspector job: (\d+)\. Job was in use for: .+$/
  }
];

module.exports = inspector;
