/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface CcInweb {
    'doNotPost': boolean;
    /**
    * prefills
    */
    'prefills': any;
    'question': string;
    /**
    * Question-Id to post responses for
    */
    'questionId': string;
    /**
    * token to submit responses
    */
    'token': string;
  }
  interface CcInwebAttributes extends StencilHTMLAttributes {
    'doNotPost'?: boolean;
    'onCc-inweb-response'?: (event: CustomEvent) => void;
    /**
    * prefills
    */
    'prefills'?: any;
    'question'?: string;
    /**
    * Question-Id to post responses for
    */
    'questionId'?: string;
    /**
    * token to submit responses
    */
    'token'?: string;
  }
}

declare global {
  interface StencilElementInterfaces {
    'CcInweb': Components.CcInweb;
  }

  interface StencilIntrinsicElements {
    'cc-inweb': Components.CcInwebAttributes;
  }


  interface HTMLCcInwebElement extends Components.CcInweb, HTMLStencilElement {}
  var HTMLCcInwebElement: {
    prototype: HTMLCcInwebElement;
    new (): HTMLCcInwebElement;
  };

  interface HTMLElementTagNameMap {
    'cc-inweb': HTMLCcInwebElement
  }

  interface ElementTagNameMap {
    'cc-inweb': HTMLCcInwebElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
