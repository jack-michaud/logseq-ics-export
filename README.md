# Logseq Calendar Export Plugin
Exports an iCal compatible `.ics` file from Logseq TODO entries.  


### Features
- Looks at all blocks with a scheduled or deadline time and creates an event for the Scheduled and Deadline times.  
  - Blocks with a time will receive a default duration of 30 minutes
  - Blocks without a time will receive a default end date of the same day
- Adds page context to calendar entry: `<block content> - <page name>`
- Generates an ICS into console.log

### TODO
- [ ] Generates ICS into a file
  - Blocked on [Plugin Storage API](https://discuss.logseq.com/t/writing-to-a-file-for-ics-export/1453)
- [ ] Creates recurring events using [RRULEs](https://www.textmagic.com/free-tools/rrule-generator)
- [ ] UI Panel for configuration
- Configuration options
  - [ ] Configure TODO filter

### Resources
- [ics](https://www.npmjs.com/package/ics)
- [Logseq Plugin Samples](https://github.com/logseq/logseq-plugin-samples)

