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
    Xd: string;
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
