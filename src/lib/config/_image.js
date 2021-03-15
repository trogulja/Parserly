const { dateConstruct } = require('./common');

const image = [
  {
    // 20180822 14:18:17.394 Processing thread started for image: \\srvczg files\ftp_claro\CRO\auto IN\Tom\plastenik_nnn_bih_22082018.jpg
    // 20190112 09:59:46.490 Processing thread started for object: C:\_claro\KLZ inputs\klz-01-input ok\fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg (threadID=83)
    id: 'o_01',
    act: 'startObject',
    desc: 'start object',
    members: [...dateConstruct, 'filepath', 'threadID'],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Processing thread started for (?:object|image):\s+(.+?)(?: \(threadID=(\d+)\))?$/,
    children: [
      {
        // 20190112 09:59:46.494 Channel 'klz-inspectorEdit' processing file: fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg
        id: 'o_02',
        act: 'startImage',
        desc: 'start image',
        members: [...dateConstruct, 'channel', 'filename'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' processing file: (.+)$/,
        children: [
          {
            // 20190112 09:59:51.459 fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg sent to inspector(1)
            id: 'o_03',
            act: 'inspectorLink',
            desc: 'sent to inspector',
            members: [...dateConstruct, 'filename', 'inspectID'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (.+) sent to inspector\((\d+)\)$/,
          },
          {
            // jvm 8    | 20210113 14:13:01.609 File can not be inspected: \\srvczg-files\ftp_claro\CRO\IN\Gilbert.tif (The process cannot access the file because it is being used by another process)
            id: 'o_77',
            act: 'criticalError',
            desc: 'file locked by another process',
            members: [...dateConstruct, 'filepath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) File can not be inspected: (.+) \(.+\)$/,
            children: [
              {
                // jvm 8    | 20210113 14:13:01.609 [lc.a(Unknown Source), l_.a(Unknown Source), l_.run(Unknown Source)]
                id: 'o_78',
                act: 'ignore',
                desc: 'error extra info',
                members: [...dateConstruct],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \[.+\]$/,
              },
              {
                // jvm 8    | 20210113 14:13:01.641 file 'Gilbert.tif' can not be copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR exception:\\srvczg-files\ftp_claro\CRO\IN\Gilbert.tif (The process cannot access the file because it is being used by another process)
                id: 'o_79',
                act: 'criticalError',
                desc: 'file locked by another process error',
                members: [...dateConstruct, 'filename', 'folderpath'],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) file '(.+)' can not be copied to folder: (.+) exception:.+$/,
              },
            ],
          },
          {
            // 20190112 09:59:47.198 (IMPROVE|IMGINFO|CONVERT|QUALITY|ADJUST|WARNING) 'ignore all these fields within this block'
            id: 'o_04',
            act: 'processingCount',
            desc: 'image processing',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:IMPROVE|IMGINFO|CONVERT|QUALITY|ADJUST|WARNING) .+$/,
          },
          {
            // 20180517 16:13:07.502 Claro has now deleted the temp. profile: 1a58a9c1-8c45-4493-a017-f36a8b986422.jpg.icc
            id: 'o_05',
            act: 'ignore',
            desc: 'image processing maintainence',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Claro has now deleted the temp\. profile: .+$/,
          },
          {
            // 20180605 13:49:11.425 transforming colorspace : exif tag indicates RGB for non RGB image
            id: 'o_06',
            act: 'ignore',
            desc: 'image processing extra',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) transforming colorspace.+$/,
          },
          {
            // 20200106 20:05:35.635 moved to:\\10.64.8.41\ftp_claro\_test\KLZAutoPicker\BAD\03c73e5d-db77-4f73-a873-a74f7d7082be.jpg (due to WARNING QUALITY)
            // 20210129 19:16:08.495 WARNING moved to:C:\_claro\InternalRoutes\KLZ\InspectorIN\902e1768-2387-4559-9f9b-808a5b230ccc.jpg (due to WARNING QUALITY)
            id: 'o_07',
            act: 'processingReject',
            desc: 'image processing auto reject 1',
            members: [...dateConstruct, 'filepath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:WARNING )?moved to:(.+) \(due to WARNING QUALITY\)$/,
          },
          {
            // 20180704 17:24:55.922 Error transforming colorspace(\\srvczg-files\ftp_claro\CRO\IN\na stocnome putu_hrt.jpg), cause:The input profile is not suitable for the colorspace of the image
            // jvm 3    | 20210223 09:26:41.319 **ERROR Error transforming colorspace(\\srvczg-files\ftp_claro\CRO\IN\laliga5_nnn_spo_210221.jpg), cause:The input profile is not suitable for the colorspace of the image
            id: 'o_08',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )?Error transforming colorspace.+$/,
          },
          {
            // 20180605 12:36:05.241 PNG does not support CMYK images, converting to RGB
            id: 'o_09',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PNG does not support CMYK images.+$/,
          },
          {
            // 20180920 16:09:22.558 java.io.IOException: There is not enough space on the disk
            id: 'o_10',
            act: 'criticalError',
            desc: 'not enough space on the disk',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) java\.io\.IOException: There is not enough space on the disk$/,
          },
          {
            // 20181202 13:05:40.062 processImage, 2nd try...
            // 20181127 15:45:30.436 Error correcting skin tones
            // 20181126 20:28:16.740 Red eye detection failure
            id: 'o_11',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:processImage, 2nd try\.\.\.|Red eye detection failure|Error correcting skin tones|Incorrect pixel stride).*$/,
          },
          {
            // 20190514 14:50:54.305 Image too large (50 MPixel) for banding reduction
            id: 'o_12',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Image too large .+ for banding reduction$/,
          },
          {
            // 20190708 14:05:15.367 corrupt embedded profile
            id: 'o_13',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) corrupt embedded profile$/,
          },
          {
            // jvm 2    | 20210222 13:06:50.851 **ERROR  conversion failure for Working ICC profile:profile 
            // 20190828 13:37:55.209  conversion failure for Working ICC profile:profile G
            id: 'o_14',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:..ERROR )? conversion failure for Working ICC profile.+$/,
            children: [
              {
                // tput
                id: 'o_72',
                act: 'ignore',
                desc: 'attached extra info',
                members: [],
                match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
              },
            ],
          },
          {
            // 20191105 15:14:23.646 Error applying noise filter
            id: 'o_15',
            act: 'processingErrorCount',
            desc: 'image processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Error applying noise filter$/,
          },
          {
            // 20190813 14:27:27.927 Output ICC profile 'C:\Applications\Elpical Claro\profiles\WAN-IFRAnewspaper26v5.icc' does not exist
            id: 'o_16',
            act: 'criticalError',
            desc: 'missing output ICC profile - configuration error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Output ICC profile '.+' does not exist$/,
          },
          {
            // 20200224 14:47:37.961 ClaroPDF storPdfFiles delete failed for: C:\Program Files\Elpical Claro\work_pdf17\SUWO_DLBG_0226_20_X\extract\SUWO_DLBG_0226_20_X.pdf
            id: 'o_17',
            act: 'error',
            desc: 'image processing error',
            members: [...dateConstruct, 'filepath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ClaroPDF storPdfFiles delete failed for: (.+)$/,
          },
          {
            // 20180803 13:00:01.964 Channel 'klz-inspectorEdit' , file '8f38997d-c7d2-42a0-b1d4-124c6aca3b0d.jpg' copied to folder: \\10.64.8.37\claro
            id: 'o_18',
            act: 'errorResolve',
            desc: 'image processing error resolve',
            members: [...dateConstruct, 'channel', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' , file '(.+)' copied to folder: .+$/,
          },
          {
            // 20190520 15:52:43.586 Channel 'cro-inspectorEdit' file 'KOSCI-1-1.tiff' can not be managed by inspector, reason:Error transforming colorspace(C:\Program Files\Elpical Claro\inspector\claro\.\rejected\20632.tiffTIF), cause:The input profile is not suitable for the colorspace of the image
            id: 'o_19',
            act: 'error',
            desc: 'inspector send error',
            members: [...dateConstruct, 'channel', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' file '(.+)' can not be managed by inspector.+$/,
          },
          {
            // 20190520 15:52:43.595 , file 'KOSCI-1-1.tiffTIF' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
            id: 'o_20',
            act: 'errorResolve',
            desc: 'inspector send error resolve',
            members: [...dateConstruct, 'filename', 'folderpath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) , file '(.+)' copied to folder: (.+)$/,
          },
          {
            // 20190116 18:37:52.228 Executing external program 'stripinfo.bat' for file test1.jpg
            id: 'o_21',
            act: 'processingCount',
            desc: 'image processing extra',
            members: [...dateConstruct, 'filename', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Executing external program '(.+)' for file (.+)$/,
            children: [
              {
                // 20190624 14:03:29.274 External program failed exit code:1
                id: 'o_22',
                act: 'criticalError',
                desc: 'image processing error - external program failed, image lost',
                members: [...dateConstruct],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) External program failed.+$/,
              },
            ],
          },
          {
            // 20190112 09:59:51.474 Channel 'klz-inspectorEdit' processed file (4.9 sec.): fc3b5a82-abab-44d1-97cc-46ec3f35a45c.jpg
            id: 'o_23',
            act: 'endImage',
            desc: 'image processing end',
            members: [...dateConstruct, 'channel', 'durationS', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' processed file \((.+) sec.\): (.+)$/,
          },
          {
            // 20180525 16:29:57.977 Channel 'cro-auto-03-processNormal' not processed file (38.8 sec.): PXL_230518_20737708.jpg // ## End Processed Auto Reject OK (due to WARNING QUALITY)
            id: 'o_24',
            act: 'endImage',
            desc: 'image processing auto reject',
            members: [...dateConstruct, 'channel', 'durationS', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' not processed file \((.+) sec.\): (.+)$/,
          },
          {
            // 20180517 17:13:26.653 during import file '494cf168-2207-4f68-a776-2432d401356d.png', cause : File can not be enhanced by claro, file '494cf168-2207-4f68-a776-2432d401356d.png' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
            id: 'o_25',
            act: 'errorResolve',
            desc: 'error resolve',
            members: [...dateConstruct, 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) during import file '(.+)', cause : .+$/,
          },
          {
            // 20180517 17:13:26.653 Thread will be terminated.
            id: 'o_26',
            act: 'ignore',
            desc: 'error resolve ignore',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Thread will be terminated\.$/,
          },
          {
            // 20200123 17:14:02.631 Error copying PDF to temporary folder
            // 20200127 16:07:28.928 Second try to copy the file also failed
            // 20200123 17:14:02.697 java.lang.NullPointerException
            id: 'o_66',
            act: 'ignore',
            desc: 'PDF handling error general warning',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:Error copying PDF to temporary folder|Second try to copy the file also failed|java\.lang\.NullPointerException)$/,
          },
          {
            // 20180709 15:10:17.110 getChannelImage EXCEPTION:java.io.FileNotFoundException: \\srvczg-files\ftp_claro\CRO\auto-IN\Tom\migranti.1.jpg (The system cannot find the file specified) msg:\\srvczg-files\ftp_claro\CRO\auto-IN\Tom\migranti.1.jpg (The system cannot find the file specified) TST:12
            // 20190726 13:06:19.364 getChannelImage EXCEPTION:java.io.IOException: File with 0 bytes msg:File with 0 bytes TST:12
            // 20190802 15:04:23.881 getChannelImage EXCEPTION:java.lang.IllegalArgumentException: Number of color/alpha components should be 4 but length of bits array is 3 msg:Number of color/alpha components should be 4 but length of bits array is 3 TST:12
            id: 'o_27',
            act: 'error',
            desc: 'getChannelImage error',
            members: [...dateConstruct, 'error'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) getChannelImage (EXCEPTION:java.+)$/,
            children: [
              {
                // jvm 8    | 20210106 12:42:02.203 [lc.a(Unknown Source), lc.a(Unknown Source), com.elpical.jclaro.channel.ChannelImage.a(Unknown Source), com.elpical.jclaro.channel.Channel.a(Unknown Source), l_.a(Unknown Source), l_.run(Unknown Source)]
                id: 'o_74',
                act: 'ignore',
                desc: 'error confirm',
                members: [...dateConstruct, 'error'],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \[(.+)\]$/,
              },
            ],
          },
          {
            // jvm 8    | 20210119 15:45:11.673 error during import file 'skoda_wall-box-charge-emobility-frankfurt.jpg', cause : \\srvczg-files\ftp_claro\CRO\IN\skoda_wall-box-charge-emobility-frankfurt.jpg (The process cannot access the file because it is being used by another process)file 'skoda_wall-box-charge-emobility-frankfurt.jpg' can not be copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR exception:\\srvczg-files\ftp_claro\CRO\IN\skoda_wall-box-charge-emobility-frankfurt.jpg (The process cannot access the file because it is being used by another process)
            // 20210129 12:37:04.687 **ERROR error during import file 'shutterstock_1784753840.jpg', cause : \\srvczg-files\ftp_claro\CRO\IN\shutterstock_1784753840.jpg (The process cannot access the file because it is being used by another process)file 'shutterstock_1784753840.jpg' can not be copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR exception:\\srvczg-files\ftp_claro\CRO\IN\shutterstock_1784753840.jpg (The process cannot access the file because it is being used by another process)
            id: 'o_73',
            act: 'error',
            desc: 'error accessing file',
            members: [...dateConstruct, 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:error|..ERROR error|..ERROR) during import file '(.+)', cause : .+$/,
            children: [
              {
                id: 'o_75',
                act: 'ignore',
                desc: 'extra info',
                members: [],
                match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
              },
            ],
          },
          {
            // 20200123 17:14:02.686 File does not exist: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_IN\KAWO_LAVA_0122_04_X.pdfPDF destination:C:\Program Files\Elpical Claro\work_pdf16\KAWO_LAVA_0122_04_X-299\extract\KAWO_LAVA_0122_04_X.pdf file size:0
            id: 'o_67',
            act: 'criticalError',
            desc: 'copy fail',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) File does not exist: .+$/,
          },
          {
            // 20190802 15:04:23.897 [com.elpical.jclaro.channel.ClaroBad.a(Unknown Source), com.elpical.jclaro.channel.ClaroBad.a(Unknown Source), com.elpical.jclaro.channel.ChannelImage.a(Unknown Source), com.elpical.jclaro.channel.Channel.a(Unknown Source), q2.a(Unknown Source), q2.run(Unknown Source)]
            id: 'o_28',
            act: 'ignore',
            desc: 'error ignore',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \[.+ClaroBad.+$/,
            children: [
              {
                // 20200120 14:59:42.819 Error PdfLoader.refersToSamePDF:
                id: 'o_62',
                act: 'error',
                desc: 'pdf error',
                members: [...dateConstruct],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Error PdfLoader\.refersToSamePDF.+$/,
                children: [
                  {
                    // file 'KAWO_LAVA_0122_04_X.xml' copied to folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_ERROR
                    id: 'o_64',
                    act: 'errorResolve',
                    desc: 'error resolve',
                    members: ['filename', 'folderpath'],
                    match: /file '(.+)' copied to folder: (.+)$/,
                  },
                  {
                    // threadid = 21688
                    // xmlFile = C:\Program Files\Elpical Claro\work_pdf16\KAWO_LAVA_0122_04_X.xml
                    // xmlFile length = 10885
                    // pdfFile = \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_IN\KAWO_LAVA_0122_04_X.pdf
                    id: 'o_63',
                    act: 'ignore',
                    desc: 'error extra info',
                    members: [],
                    match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
                  },
                ],
              },
            ],
          },
          {
            // 20180607 15:38:33.912 getChannelImage EXCEPTION:com.elpical.io.readers.DecodingException: ColorSpace not specified, probably no Photoshop EPS msg:ColorSpace not specified, probably no Photoshop EPS TST:12
            // 20180528 15:20:08.771 getChannelImage EXCEPTION:com.elpical.jclaro.channel.OverSizedException: imagesize exceeds maximum imagesize(50320896 pixel > 50 Mpixel) msg:imagesize exceeds maximum imagesize(50320896 pixel > 50 Mpixel) TST:12
            // 20200203 16:48:31.013 getChannelImage EXCEPTION:com.elpical.jclaro.channel.OverSizedException: filesize exceeds maximum filesize(15393140 size > 10 MByte) msg:filesize exceeds maximum filesize(15393140 size > 10 MByte) TST:12
            id: 'o_29',
            act: 'error',
            desc: 'getChannelImage warning',
            members: [...dateConstruct, 'error'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) getChannelImage (EXCEPTION:com\.elpical.+)$/,
            children: [
              {
                // jvm 8    | 20210106 11:04:46.598 [lc.a(Unknown Source), lc.a(Unknown Source), com.elpical.jclaro.channel.ChannelImage.a(Unknown Source), com.elpical.jclaro.channel.Channel.a(Unknown Source), l_.a(Unknown Source), l_.run(Unknown Source)]
                id: 'o_76',
                act: 'ignore',
                desc: 'error confirm',
                members: [...dateConstruct, 'error'],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \[(.+)\]$/,
              },
              {
                // jvm 1    | 20210124 18:12:47.324 **ERROR INPUT  : in image 'feng_158502052_xl.jpg', imagesize exceeds maximum imagesize(54360576 pixel > 50 Mpixel)file 'feng_158502052_xl.jpg' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
                // jvm 3    | 20210224 12:39:21.729 **ERROR INPUT  : in image 'bolnica_bistra1.jpg', filesize exceeds maximum filesize(11126383 size > 10 MByte)file 'bolnica_bistra1.jpg' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
                id: 'o_81',
                act: 'ignore',
                desc: 'error extra info',
                members: [...dateConstruct],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ..ERROR INPUT  : in image '(.+)', (?:image|file)size exceeds maximum (?:image|file)size.+$/
              }
            ],
          },
          {
            // 20180528 15:20:08.849 INPUT  : in image 'Marino Markezic.jpg', imagesize exceeds maximum imagesize(50320896 pixel > 50 Mpixel), file 'Marino Markezic.jpg' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
            // 20200203 16:48:32.003 INPUT  : in image 'PXL_030220_27814899.jpg', filesize exceeds maximum filesize(15393140 size > 10 MByte)file 'PXL_030220_27814899.jpg' copied to folder: \\srvczg-files\ftp_claro\CRO\ERROR
            id: 'o_30',
            act: 'errorResolve',
            desc: 'warning resolve',
            members: [...dateConstruct, 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) INPUT.+in image '(.+)', (?:imagesize|filesize) exceeds .+$/,
          },
          {
            // 20190802 15:10:33.221 IOException: com.sun.org.apache.xerces.internal.impl.io.MalformedByteSequenceException: Invalid byte 1 of 1-byte UTF-8 sequence. // ## End error 8 (critical PDF read error)
            id: 'o_32',
            act: 'criticalError',
            desc: 'error critical',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) IOException: com\.sun\.org\.apache\.xerces\.internal\.impl\.io\.MalformedByteSequenceException.+$/,
          },
          {
            // 20191104 19:46:17.024 The current file is already processed by another server (1). // ## End error 9 (critical configuration error)
            id: 'o_33',
            act: 'criticalError',
            desc: 'error critical - bad configuration, multiple server instances',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) The current file is already processed by another server.*$/,
          },
          {
            // 20191217 21:02:45.018 catch van ClaroProcessingThread process: java.lang.ArrayIndexOutOfBoundsException: -1
            id: 'o_34',
            act: 'criticalError',
            desc: 'error critical',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) catch van ClaroProcessingThread process: java\.lang\.ArrayIndexOutOfBoundsException.+$/,
          },
          {
            // 20190722 15:07:04.213 ClaroIO.storeChannelImage - writeFile has returned null! (1)
            id: 'o_38',
            act: 'criticalError',
            desc: 'error critical',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ClaroIO\.storeChannelImage - writeFile has returned null!.+$/,
            children: [
              {
                // Relevant parameters to writeFile:
                // fname = olmo4.jpg
                // exportdir = C:\_claro\CRO-route\T
                // format = 1
                // isOriginalImage = false
                // bFromInspector = false
                // Channel = cro-auto-01-input
                id: 'o_39',
                act: 'criticalError',
                desc: 'error extra info',
                members: [],
                match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
              },
            ],
          },
          {
            // 20180616 19:24:15.223 too few colors for image processing
            id: 'o_46',
            act: 'ignore',
            desc: 'pdf processing',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) too few colors for image processing$/,
          },
          {
            // 20180616 19:18:06.953 Extracting images from pdf
            id: 'o_47',
            act: 'ignore',
            desc: 'pdf processing',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Extracting images from pdf$/,
          },
          {
            // 20180616 19:18:06.984 Processing page: 1/9
            id: 'o_48',
            act: 'ignore',
            desc: 'pdf processing',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Processing page: \d+\/\d+$/,
          },
          {
            // 20180616 19:18:16.281 9 images extracted
            id: 'o_49',
            act: 'ignore',
            desc: 'pdf processing',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) \d+ images extracted$/,
          },
          {
            // 20180822 12:54:25.881 Channel 'cro-auto-01-input'  processed file: korice_obz_200818.pdf  // 0 images extracted
            id: 'o_50',
            act: 'endPDFNothingDone',
            desc: 'pdf end nothing done',
            members: [...dateConstruct, 'channel', 'filename'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)'  processed file: (.+)$/,
          },
          {
            // 20190510 16:02:57.486 extracting image: DeviceN ColorSpace DEFAULT not supported
            id: 'o_51',
            act: 'processingErrorCount',
            desc: 'pdf processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) extracting image: .+ not supported$/,
          },
          {
            // 20190701 11:34:20.808 extracting image: Separation ColorSpace not processed
            id: 'o_52',
            act: 'processingErrorCount',
            desc: 'pdf processing error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) extracting image: Separation ColorSpace not processed$/,
          },
          {
            // 20200226 07:58:19.713 PdfExtract.getPdfImages:
            id: 'o_53',
            act: 'criticalError',
            desc: 'pdf critical error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PdfExtract\.getPdfImages.+$/,
            children: [
              {
                // 20200226 07:58:19.714 PdfExtract.getPdfImages: file: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Stmk_IN\MUZE_JUBG_0227_60_X.pdf
                id: 'o_54',
                act: 'ignore',
                desc: 'pdf critical error confirmation',
                members: [...dateConstruct],
                match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PdfExtract\.getPdfImages.+$/,
              },
            ],
          },
          {
            // 20200226 11:18:52.777 catch of ClaroProcessingThread process: java.util.NoSuchElementException
            id: 'o_55',
            act: 'criticalError',
            desc: 'error critical',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) catch of ClaroProcessingThread process.+$/,
          },
          {
            // 20200224 16:10:25.460 Unsupported colorspace
            // 20200224 16:10:25.460 Error replacing obj: 37 0
            // 20200224 16:10:25.460 com.elpical.io.readers.DecodingException: 9 0 i9
            //   value:
            // 20200224 16:10:25.461 Error replacing obj: 38 0
            // 20200224 16:10:25.461 com.elpical.io.writers.EncodingException: could not retrieve object
            id: 'o_56',
            act: 'processingErrorCount',
            desc: 'pdf replace object error',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) (?:Unsupported colorspace|Error replacing obj|com\.elpical\.io\.(?:readers\.Decoding|writers\.Encoding)Exception).*$/,
            children: [
              {
                // value:
                id: 'o_57',
                act: 'ignore',
                desc: 'ignore',
                members: [],
                match: /(?!(?:jvm \d+\s+\| )?\d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/,
              },
            ],
          },
          {
            // jvm 1    | 20210122 16:24:23.236 **ERROR  Output ICC profile for B&W conversion not active
            id: 'o_80',
            act: 'ignore',
            desc: 'not converting to B&W',
            members: [...dateConstruct],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ..ERROR  Output ICC profile.+not active$/
          }
        ],
      },
      {
        // 20210201 12:01:44.869 Processing thread finished. (threadID=127060, hostname=SRVCZG-PAMENDO)
        id: 'o_61',
        act: 'endObject',
        desc: 'object end',
        members: [...dateConstruct, 'threadID', 'hostname'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Processing thread finished\. \(threadID=(\d+), hostname=(.+)\)$/,
      },
      {
        // 20190716 15:32:31.026 The job-file appears to be invalid!
        id: 'o_35',
        act: 'error',
        desc: 'error - malformed xml file',
        members: [...dateConstruct],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) The job-file appears to be invalid!$/,
        children: [
          {
            // 20190716 15:32:31.029 in jobfile '\\srvsgr-clf02\M4_DWFL\automatische_Workflows\PRESSE\Claro\Zeitung_NewsNT\IN-Zeitung\20190715_171352_hbre072031_re4_bild2.XML' unknown format
            id: 'o_36',
            act: 'ignore',
            desc: 'error reason',
            members: [...dateConstruct, 'filepath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) in jobfile '(.+)' unknown format$/,
          },
          {
            // 20190716 15:32:31.044 , file '20190715_171352_hbre072031_re4_bild2.XML' copied to folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\PRESSE\Claro\Zeitung_NewsNT\ERROR-Zeitung
            id: 'o_37',
            act: 'errorResolve',
            desc: 'error critical resolve',
            members: [...dateConstruct, 'filename', 'folderpath'],
            match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) , file '(.+)' copied to folder: (.+)$/,
          },
        ],
      },
      {
        // 20191220 12:35:11.121 ClaroPDF readPdfXmlFile 2: org.xml.sax.SAXParseException; lineNumber: 1; columnNumber: 9707; Character reference "&#
        id: 'o_65',
        act: 'criticalError',
        desc: 'pdf error',
        members: [...dateConstruct],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) ClaroPDF readPdfXmlFile .+SAXParseException.+$/,
      },
      {
        // 20180601 15:42:35.683 channel 'cro-auto-01-input' imgfile can not be read.
        id: 'o_31',
        act: 'criticalError',
        desc: 'error critical',
        members: [...dateConstruct, 'channel'],
        match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) channel '(.+)' imgfile can not be read.$/,
      },
      {
        // xmlFile = C:\Program Files\Elpical Claro\work_pdf16\KAWO_SPIT_0219_42_X.xml
        id: 'o_68',
        act: 'error',
        desc: 'pdf handle error',
        members: ['filepath'],
        match: /xmlFile = (.+)$/,
        children: [
          {
            // xmlFile length = 6935
            id: 'o_69',
            act: 'ignore',
            desc: 'pdf handle error',
            members: [],
            match: /xmlFile length = .+$/,
          },
          {
            // pdfFile = \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_IN\KAWO_SPIT_0219_42_X.pdf
            id: 'o_70',
            act: 'error',
            desc: 'belongs to this pdf',
            members: ['filepath'],
            match: /pdfFile = (.+)$/,
          },
          {
            // file 'KAWO_SPIT_0219_42_X.xml' copied to folder: \\srvsgr-clf02\M4_DWFL\automatische_Workflows\RMA\CLARO_Ktn_ERROR
            id: 'o_71',
            act: 'errorResolve',
            desc: 'copied to error folder',
            members: ['filename', 'folderpath'],
            match: /file '(.+)' copied to folder: (.+)$/,
          },
        ],
      },
    ],
  },
  {
    // 20180616 19:18:06.437 Initialise document
    id: 'o_58',
    act: 'ignore',
    desc: 'pdf ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Initialise document$/,
  },
  {
    // 20180616 19:19:42.847 Writing new pdf
    id: 'o_59',
    act: 'ignore',
    desc: 'pdf ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Writing new pdf$/,
  },
  {
    // 20181003 13:50:32.979 Channel 'cro-inspectorEdit' processed file : ekran5.pdf // after writing new pdf
    id: 'o_60',
    act: 'ignore',
    desc: 'pdf ignore',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Channel '(.+)' processed file : (.+)$/,
  },
];

module.exports = image;
