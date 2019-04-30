import { Question } from './question';

export interface Settings {
  logoURL: string;
  backgroundURL: string;
  businessName: string;
  branding: string;
  businessCountry: string;
  businessTagline: string;
  colorCode1: string;
  colorCode2: string;
  colorCode3: string;
  welcomeTitle: string;
  welcomeText: string;
  welcomeAudio: any;
  welcomeImage: string;
  thankyouTitle: string;
  thankyouText: string;
  thankyouAudio: any;
  thankyouImage: string;
  disclaimerText: string;
  welcomeDisclaimerText: string;
  translated: any;
  textStyles: Array<{
    name: string;
    fontName: string;
    fontSize: any;
    fontStyle: string;
    fontColor: string;
  }>;
  questions: Array<Question>;
  preFill: Array<any>;
  reCaptchaSiteKey: string;
  classicCaptcha: boolean;
  skipWelcome: boolean;
  partialResponseId: string;
  doNotSocialShare: string;
  attributes: any;
  preferredStation: string;
  preferredLanguage?: string;
  selectedLanguage?: string;
  token?: string;
  socialShareMessage?: string;
  accountSpecificSettings?: [ { key: string; value: string } ];
  customMetrics: {
    [ key: string ]: CustomAnchorMetric
  };
  redirectOnSubmit?: string;
}

/**Custom Anchor Metric Config */
export interface CustomAnchorMetric {
  /**Display Name for Anchor Metric */
  name: string;
  /**DisplayType for the question to which this Metric is assigned */
  displayType: string;
  /**
   * Option Range for the question to which this Metric is assigned
   * Ex: 1-7
   */
  optionRange: string;
  /**Bucket Option As Categories */
  optionCategories: OptionCategory[];
  /**Metric Range(Format : LowerRange, HigherRange ex: 3,4) */
  metricRange: string;
}


export interface OptionCategory {
  /**Name of the Category */
  name: string;
  /**Label to displayed for this Category */
  label: string;
  /**Color for this Category */
  color: string;
  /**Category Range(Format : FromValue, ToValue ex: 0,3 -> From 0 to 3) */
  categoryRange: string;
}