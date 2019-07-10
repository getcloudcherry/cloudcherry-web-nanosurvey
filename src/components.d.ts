/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface CcInweb {
    /**
    * Show conditional thank you message based on the response works only for Yes/No question
    */
    'conditionalThankYou': {
      yes: string;
      no: string;
    };
    /**
    * Callbacks that will evaluate a condition for thank you text
    */
    'conditionalThankYouTextCallBack': any;
    /**
    * Use Custom key for managing throttling
    */
    'cookieId': any;
    /**
    * Opt out of sending response to server. Handle in event hooks
    */
    'doNotPost': boolean;
    /**
    * Question id for follow up response
    */
    'followUpQuestionId': string;
    /**
    * Dictionary of followUp options to be asked
    */
    'followUpQuestions': any;
    /**
    * Optionally hide the survey after submission
    */
    'hideAfterSubmission': boolean;
    /**
    * Use icons or text based options
    */
    'icons': "show" | "hide";
    'model': any;
    'position': "above" | "below";
    /**
    * prefills
    */
    'prefills': any;
    /**
    * Question text that will be shown to the user
    */
    'question': string;
    /**
    * Question-Id to post responses for
    */
    'questionId': string;
    /**
    * Set survey settings from a central location. This will be handy to use same token with multiple survey within a page.
    */
    'surveySettings': any;
    /**
    * Configure throttling duration
    */
    'throttleForDays': number;
    /**
    * token to submit responses
    */
    'token': string;
    'type': any;
    /**
    * Force the component to get token settings from server. It will use the first valid question to show.
    */
    'useToken': boolean;
  }
}

declare global {


  interface HTMLCcInwebElement extends Components.CcInweb, HTMLStencilElement {}
  var HTMLCcInwebElement: {
    prototype: HTMLCcInwebElement;
    new (): HTMLCcInwebElement;
  };
  interface HTMLElementTagNameMap {
    'cc-inweb': HTMLCcInwebElement;
  }
}

declare namespace LocalJSX {
  interface CcInweb extends JSXBase.HTMLAttributes<HTMLCcInwebElement> {
    /**
    * Show conditional thank you message based on the response works only for Yes/No question
    */
    'conditionalThankYou'?: {
      yes: string;
      no: string;
    };
    /**
    * Callbacks that will evaluate a condition for thank you text
    */
    'conditionalThankYouTextCallBack'?: any;
    /**
    * Use Custom key for managing throttling
    */
    'cookieId'?: any;
    /**
    * Opt out of sending response to server. Handle in event hooks
    */
    'doNotPost'?: boolean;
    /**
    * Question id for follow up response
    */
    'followUpQuestionId'?: string;
    /**
    * Dictionary of followUp options to be asked
    */
    'followUpQuestions'?: any;
    /**
    * Optionally hide the survey after submission
    */
    'hideAfterSubmission'?: boolean;
    /**
    * Use icons or text based options
    */
    'icons'?: "show" | "hide";
    'model'?: any;
    'onCc-inweb-response'?: (event: CustomEvent<any>) => void;
    'position'?: "above" | "below";
    /**
    * prefills
    */
    'prefills'?: any;
    /**
    * Question text that will be shown to the user
    */
    'question'?: string;
    /**
    * Question-Id to post responses for
    */
    'questionId'?: string;
    /**
    * Set survey settings from a central location. This will be handy to use same token with multiple survey within a page.
    */
    'surveySettings'?: any;
    /**
    * Configure throttling duration
    */
    'throttleForDays'?: number;
    /**
    * token to submit responses
    */
    'token'?: string;
    'type'?: any;
    /**
    * Force the component to get token settings from server. It will use the first valid question to show.
    */
    'useToken'?: boolean;
  }

  interface IntrinsicElements {
    'cc-inweb': CcInweb;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


