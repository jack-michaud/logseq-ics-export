import '@logseq/libs';
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin';

import {
  fetchTodoItems
} from './entities';

import { convertTodoToEvent, dumpToIcs } from './ics';


const syncCalendar = () => {
  logseq.App.showMsg("Syncing calendar...");
  fetchTodoItems(logseq.DB.datascriptQuery).then((items) => {
    const events = items.reduce((acc, item) => {
      return acc.concat(convertTodoToEvent(item))
    }, [])
    return dumpToIcs(logseq, events)
  });
};

/**
 * main entry
 * @param baseInfo
 */
function main (baseInfo: LSPluginBaseInfo) {
  syncCalendar();
}

// bootstrap
logseq.ready({ syncCalendar }, main).catch(console.error)
