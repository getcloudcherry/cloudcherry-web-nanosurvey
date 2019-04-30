import { Question } from './question';
import { Settings } from './settings';
export { Question, Filter } from './question';

export interface SurveyResponse {
  questionId: string;
  textInput: string;
  numberInput: number;
  questionText: string;
}

export interface State {
  settings: Settings;
  isAPIPostFilling: boolean;
  token?: string;
  list: Array<CurrentState>;
  context: any;
  isWelcome: boolean;
  isThankYou: boolean;
  currentIndex: number;
  progressFrozen: boolean;
  thankYouMessage?: string;
  clientFilledResponses?: Array<SurveyResponse>;
  animationState?: string | undefined;
  mode?: 'kiosk';
  brandColor: string;
  branding?: Branding;
  rightToLeft?: boolean;
  skipQuestionByInteractiveFill?: Array<string>;
  skipResponseByInteractiveFill?: Array<string>;
  // hide next button when changing questions and required questions
  hideNextButton?: boolean;
  skipWelcomePage?: boolean;
}

export interface CurrentState {
  question: Question;
  response: SurveyResponse;
  isLast: boolean;
  isFirst: boolean;
}

export type Branding = 'FULL' | 'REDUCED' | 'MINIMAL' | 'NONE';