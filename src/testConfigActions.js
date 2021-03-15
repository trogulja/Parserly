const b = {
  d: [ 'ignore', 'resetPointer' ],
  i: [ 'error', 'errorResolve', 'ignore', 'inspected' ],
  o: [
    'startObject',
      'startImage',
        'processingCount',
        'processingErrorCount',
        'processingReject',
        'inspectorLink',
      'endImage',
      'endPDFNothingDone',
    'endObject',
    'error',
      'errorResolve',
    'criticalError',
  ],
  p: [ 'purgeCount' ],
  r: [
    'startRoute',
    'endRoute',
    'error',
    'errorResolve',
    'ignore',
  ],
  s: [ 'criticalError', 'error', 'errorResolve', 'ignore' ]
}