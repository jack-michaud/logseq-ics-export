import '@logseq/libs';
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin';

import {
  TodoItem,
} from './entities';

import { convertTodoToEvent, dumpToIcs } from './ics';

const scheduledQuery = `
[:find (pull ?h [*])
 :where
 [?h :block/marker ?marker]
 [(not= "DONE" ?marker)]
 [(not= "CANCELED" ?marker)]
 [?h :block/scheduled ?scheduled]]
`;

const deadlineQuery = `
[:find (pull ?h [*])
 :where
 [?h :block/marker ?marker]
 [(not= "DONE" ?marker)]
 [(not= "CANCELED" ?marker)]
 [?h :block/deadline ?deadline]]
`;

const fetchTodoItems = async (): Promise<TodoItem[]> => {
  return Promise.all([
    logseq.DB.datascriptQuery(deadlineQuery),
    logseq.DB.datascriptQuery(scheduledQuery)
  ]).then(allResults => {

    // if any results are null
    if (allResults.some((result) => result == null)) {
      // retry in a second
      return new Promise((res, rej) => {
        setTimeout(() => {
          fetchTodoItems()
            .then(results => res(results))
            .catch(err => rej(err));
        }, 1000);
      });
    }

    let results = allResults[0].concat(allResults[1]);

    // Flatten the result.
    let todoItems: TodoItem[] = results.map((result: any[]) => result[0]);

    // Dedupe the results using uuid.
    let dedupedTodoItems = {};
    todoItems.map(item => {
      let key = item.uuid.Xd;
      if (dedupedTodoItems[key] == undefined) {
        dedupedTodoItems[key] = item;
        console.log(item);
      }
    })
    return Object.values(dedupedTodoItems);
  });
};


const syncCalendar = () => {
  logseq.App.showMsg("Syncing calendar...");
  fetchTodoItems().then((items) => {
    const events = items.reduce((acc, item) => {
      return acc.concat(convertTodoToEvent(item))
    }, [])
    dumpToIcs(events, "/tmp/test.ics")
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
