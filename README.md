# Parserly
Parsing logs and generating reports

# TODO
- [x] parse log files
  - [x] regex for all currently known lines
  - [ ] unseen lines reporting
    - [ ] context grabbing (+-50 lines)
    - [x] state report (where are the pointers)
    - [ ] pack into debug information - send for review
- [ ] event functions
  - [x] purge
  - [x] route
  - [x] image editing
    - [x] start
    - [x] end
    - [x] errors
  - [x] image inspect
    - [x] create object
  - [ ] critical error reporting
- [ ] database
  - [ ] add configuration table
  - [x] unique statement
  - [ ] indexes on select statements
- [ ] read dir with config files
  - [ ] add configuration options
  - [ ] after read, mark file as read, move to backup location
    - [ ] determine file rename options
    - [ ] add config options to backup old logs (move to another dir)
- [ ] crontab
  - [ ] read files on determined time (10min?)
  - [ ] send results to Marvin on determined time (5min after read files)
- [ ] api
  - [ ] monthly data prepared for Compiley
  - [ ] configuration options ?
- [ ] gui
   - [ ] status
   - [ ] config options
   - [ ] error review
   - [ ] manual backup of files
   - [ ] backup list
   