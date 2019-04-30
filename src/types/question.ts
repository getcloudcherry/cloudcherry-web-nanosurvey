export interface Question {
  id: string;
  user: string;
  setName: string;
  sequence: number;
  text: string;
  audio: any;
  displayType: string;
  multiSelect: Array<string>;
  displayLegend: Array<string>;
  multiSelectChoiceTag: Array<any>;
  leadingDisplayTexts: Array<{
    text: string;
    filter: Filter;
    displayLegend?: Array<string>;
    multiSelect: Array<string>;
    audio: any;
    language?: string;
  }>;
  staffFill: boolean;
  apiFill: boolean;
  displayLocation: Array<string>;
  displayLocationByTag: Array<string>;
  userWeight: number;
  displayStyle: string;
  conditionalToQuestion: any;
  conditionalAnswerCheck: any;
  conditionalNumber: number;
  endOfSurvey: boolean;
  endOfSurveyMessage: string;
  conditionalFilter: Filter;
  presentationMode: string;
  analyticsTag: any;
  isRequired: boolean;
  questionTags: Array<string>;
  topicTags: Array<string>;
  goodAfter: any;
  goodBefore: any;
  timeOfDayAfter: any;
  timeOfDayBefore: any;
  isRetired: boolean;
  note: string;
  backgroundURL: string;
  disclaimerText: string;
  validationRegex: any;
  validationHint: string;
  translated: {
    string: {
      text: string;
      audio: any;
      multiSelect: Array<string>;
      endOfSurveyMessage: string;
      endOfSurveyAudio: any;
      disclaimerText: string;
      validationRegex: any;
      displayLegend: Array<string>;
    }
  };
  sensitiveData: any;
  timeLimit: number;
  interactiveLiveAPIPreFillUrl: string;
  restrictedData: boolean;
  attributes: any;
  perLocationOverride: any;
  selectedLanguage?: string;
  conditionalText?: {
    text: string;
    multiSelect: Array<string>;
    displayLegend?: Array<string>;
  },
  anchorMetricName: null
}

export interface Filter {
  location: string;
  afterdate: any;
  beforedate: any;
  filterquestions: Array<Condition>;
  archived: boolean;
  channel: any;
  withTickets: boolean;
  withTicketStatus: boolean;
  withNotes: boolean;
  notesWithAttachmentType: any;
  notesMediaTheme: any;
  notesMediaMood: any;
  onlyWithAttachments: boolean;
  days: number;
  aftertime: any;
  beforetime: any;
  ticket: any;
  filterName: any;
  ignoreOutliers: boolean;
};

export interface Condition {
  answerCheck: Array<string>;
  groupBy: string;
  number: number;
  questionId: string;
}

