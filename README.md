# Logseq Calendar Export Plugin
Exports an iCal compatible `.ics` file from Logseq TODO entries.  


### Features
- Looks at all TODO entries and creates an event for the Scheduled and Deadline times.  
  - TODOs with a time will receive a default duration of 30 minutes
  - TODOs without a time will receive a default end date of the same day
- Generates an ICS into console.log

### TODO
- [ ] Generates ICS into a file
- [ ] Looks at all TODO entries and creates reminders for scheduled times and event at the deadline time
- [ ] Creates recurring events using [RRULEs](https://www.textmagic.com/free-tools/rrule-generator)

### Resources
- [ics](https://www.npmjs.com/package/ics)
- [Logseq Plugin Samples](https://github.com/logseq/logseq-plugin-samples)

