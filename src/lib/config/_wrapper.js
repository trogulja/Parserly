const { dateConstruct } = require('./common');

const wrapper = [
  {
    // wrapper  | JVM appears hung: Timed out waiting for signal from JVM.
    // wrapper  | JVM did not exit on request, terminated
    id: 'w_01',
    act: 'ignore',
    desc: 'wrapper terminates JVM',
    members: [],
    match: /^wrapper\s+\| (?:JVM appears hung: Timed out waiting for signal from JVM.|JVM did not exit on request, terminated)$/,
  },
  {
    // wrapper  | Launching a JVM...
    id: 'w_02',
    act: 'ignore',
    desc: 'wrapper launching JVM',
    members: [],
    match: /^wrapper\s+\| Launching a JVM\.\.\.$/,
  },
  {
    // wrapper  | <-- Wrapper Stopped
    id: 'w_03',
    act: 'ignore',
    desc: 'wrapper stopped',
    members: [],
    match: /^wrapper\s+\| (?:.+)?Wrapper Stopped$/,
  },
  {
    // wrapper  | --> Wrapper Started as Service
    id: 'w_04',
    act: 'ignore',
    desc: 'wrapper started',
    members: [],
    match: /^wrapper\s+\| (?:.+)?Wrapper Started(?:.+)?$/,
  },
  {
    // wrapper  | Wrapper Process has not received any CPU time for 13 seconds.  Extending timeouts.
    id: 'w_05',
    act: 'ignore',
    desc: 'wrapper reports stressed system',
    members: ['seconds'],
    match: /^wrapper\s+\| Wrapper Process has not received any CPU time for (\d+) seconds.+$/,
  },
  {
    // jvm 10   | Wrapper (Version 3.2.3) http://wrapper.tanukisoftware.org
    id: 'w_06',
    act: 'ignore',
    desc: 'wrapper bootup',
    members: [],
    match: /^jvm \d+\s+\| Wrapper \(Version .+\).*$/,
    children: [
      {
        // jvm 10   | WARNING: An illegal reflective access operation has occurred
        id: 'w_07',
        act: 'ignore',
        desc: 'wrapper warning',
        members: ['error'],
        match: /^jvm \d+\s+\| WARNING: (.+)$/
      },
      {
        // jvm 10   |   Copyright 1999-2006 Tanuki Software, Inc.  All Rights Reserved.
        // jvm 10   |
        id: 'w_08',
        act: 'ignore',
        desc: 'wrapper post bootup',
        members: [],
        match: /^jvm \d+\s+\|(?! \d{8} \d{2}:\d{2}:\d{2}.\d{3}).+$/
      },
    ],
  },
  {
    // jvm 10   | 20210122 12:04:32.701 Shutting down in progress
    // jvm 10   | 20210122 12:04:32.716 Shutting down in progress...
    id: 'w_09',
    act: 'ignore',
    desc: 'shut down progress',
    members: [...dateConstruct],
    match: /^jvm \d+\s+\| (\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Shutting down in progress.*$/
  },
  {
    // jvm 10   | 20210122 12:04:38.467 Shutting down now
    id: 'w_10',
    act: 'ignore',
    desc: 'shut down',
    members: [...dateConstruct],
    match: /^jvm \d+\s+\| (\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) Shutting down now$/
  }
];

module.exports = wrapper;
