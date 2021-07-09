export interface Page {
  "journal?": boolean;
  "journal-day": number;
  name: string;
  "original-name": string;
  properties?: {
    title?: string;
  };
};

export interface TodoItem {
  body: AnyBody[];
  "repeated?": boolean;
  content: string;
  marker: string;
  // ISO Date
  deadline?: number;
  // ISO Date
  scheduled?: number;
  uuid: {
    uuid: string;
  };
};

export interface Timestamp {
  date: {
    year: number;
    month: number;
    day: number;
  };
  wday: string;
  time: {
    hour: number;
    min: number;
  };
  repetition?: [
    string[], // Repetition type. e.g. DoublePlus
    string[], // Span. e.g. Week
    number    // How many spans
  ];
  active: boolean;
};

type BodyType = "Plain" | "Paragraph" | "Timestamp" | "Break_Line" | "List";
export type TimestampType = "Scheduled" | "Deadline";

type BodyValue = any;
export type Body<T extends BodyType, V extends BodyValue> = [T, V];

export type AnyBody = Body<BodyType, BodyValue>;
export type PlainBody = Body<"Plain", string>;
export type ParagraphBody = Body<"Paragraph", Body<BodyType, BodyValue>[]>;
export type TimestampBody = Body<"Timestamp", [TimestampType, Timestamp]>;
export type ListBody = Body<"List", { content: Body<BodyType, BodyValue>[]; ordered: boolean; }[]>;
export type BreakLineBody = Body<"Break_Line", undefined>;


export const recFindTimestamp = (bodies: AnyBody[], label: TimestampType): Timestamp | null => {
  for (let body of bodies) {
    let bodyType = body[0];
    switch (bodyType) {
      case "Timestamp":
        let tsBodyValue = (body as TimestampBody)[1];
        let [timestampType, timestampValue] = tsBodyValue;
        if (timestampType == label) {
          return timestampValue;
        }
        break;
      case "Paragraph":
        let paragraphValue = (body as ParagraphBody)[1];
        let ret = recFindTimestamp(paragraphValue, label);
        if (ret != null) {
          return ret;
        }
        break;
      case "List":
        let listValue = (body as ListBody)[1];
        for (let val of listValue) {
          let ret = recFindTimestamp(val.content, label);
          if (ret != null) {
            return ret;
          }
        }
        break;
      case "Plain":
        break;
      case "Break_Line":
        break;
    default:
      throw new Error(`Unrecognized body type; augment BodyType with ${bodyType}`);
    }
  }
}

const scheduledQuery = `
[:find (pull ?p [*]) (pull ?h [*])
 :where
 [?h :block/scheduled ?scheduled]
 [?h :block/page ?p]
 [?p :block/name ?name]]
`;

const deadlineQuery = `
[:find (pull ?p [*]) (pull ?h [*])
 :where
 [?h :block/deadline ?deadline]
 [?h :block/page ?p]
 [?p :block/name ?name]]
`;

export const fetchTodoItems = async (runQuery: (query: any) => Promise<any>): Promise<[Page, TodoItem][]> => {
  return Promise.all([
    runQuery(deadlineQuery),
    runQuery(scheduledQuery)
  ]).then(allResults => {

    // if any results are null
    if (allResults.some((result) => result == null)) {
      // retry in a second
      return new Promise((res, rej) => {
        setTimeout(() => {
          fetchTodoItems(runQuery)
            .then(results => res(results))
            .catch(err => rej(err));
        }, 1000);
      });
    }

    // The results should be tuples of pages and blocks (as defined by the two :find clauses).
    let results: [Page, TodoItem][] = allResults[0].concat(allResults[1]);

    // Dedupe the results using uuid.
    let dedupedTodoItems = {};
    results.map(([page, item]) => {
      let key = item.uuid.uuid;
      if (dedupedTodoItems[key] == undefined) {
        dedupedTodoItems[key] = [page, item];
      }
    })
    return Object.values(dedupedTodoItems);
  });
};
