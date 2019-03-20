import { Component, Prop, Event, EventEmitter, State, Element } from '@stencil/core';
import { sendRequest } from '../../utils/utils';

/**
 * 
 * CC-Inweb channel
 * 
 * support only 'Yes'/'No'
 * as single select question
 * 
 * @attributes - 
 *  token
 *  questionId
 *  prefills
 * 
 *  posts response against given questionId to given token.
 * 
 *  Usually token has to be more number of usages
 * 
 */

@Component( {
  tag: 'cc-inweb',
  styleUrl: 'inweb.component.scss',
  shadow: true
} )
export class Inweb {
  /**
   * token to submit responses
   */
  @Prop() token: string;

  /**
   * Question-Id to post responses for
   */
  @Prop() questionId: string;

  /**
   * prefills
   */
  @Prop() prefills: any;

  @Prop() question = 'Was this helpful?';
  @Element() el;
  @Prop() doNotPost = false;
  @State() responseState: 'init' | 'answered' | 'submitted' = 'init';
  @Event( {
    eventName: 'cc-inweb-response'
  } ) responded: EventEmitter;

  submit( response: boolean ) {
    let responses = [];
    let _response = {
      questionId: this.questionId,
      questionText: this.question,
      textInput: response ? 'Yes' : 'No',
      numberInput: null
    };
    let prefills = [];
    if ( this.prefills ) {
      Object.keys( this.prefills ).forEach( x => {
        prefills.push( {
          questionId: x,
          questionText: null,
          textInput: typeof this.prefills[ x ] === 'string' ? this.prefills[ x ] : null,
          numberInput: typeof this.prefills[ x ] === 'number' ? this.prefills[ x ] : null
        } )
      } )
    }
    responses.push( ...prefills, _response );

    let payload = {
      surveyClient: 'Inweb',
      responses
    }

    this.responded.emit( {
      question: this.question,
      response: response,
      responseAsAnswer: _response,
      prefills: this.prefills
    } );

    if ( this.token && !this.doNotPost ) {
      this.responseState = 'answered';
      sendRequest( this.token, payload ).then( ( response ) => {
        console.log( response );
        if ( response ) {
          this.responseState = 'submitted';
          this.createCookie( this.el.id, true, 3 )
        }
      }, ( err ) => {
        console.error( 'Unable to submit response', err );
        this.responseState = 'init';
      }
      );
    }
  }

  createCookie( name, value, days ) {
    if ( days ) {
      var date = new Date();
      date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
      var expires = "; expires=" + date.toUTCString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  readCookie( name ) {
    var nameEQ = name + "=";
    var ca = document.cookie.split( ';' );
    for ( var i = 0; i < ca.length; i++ ) {
      var c = ca[ i ];
      while ( c.charAt( 0 ) == ' ' ) c = c.substring( 1, c.length );
      if ( c.indexOf( nameEQ ) == 0 ) return c.substring( nameEQ.length, c.length );
    }
    return null;
  }

  render() {
    const survey = <div class="container">
      <div class="question">{ this.question }</div>
      <div class="options">
        <img src="../assets/up.svg" onClick={ () => this.submit( true ) } />
        <img src="../assets/down.svg" onClick={ () => this.submit( false ) } />
      </div>
    </div>;
    const thankYouNote = <div class="text">
      Thank you for your response!
    </div>;
    const submitted = <div>
    </div>
    const isCookieSet = this.readCookie( this.el.id );

    if ( this.responseState === 'submitted' || isCookieSet ) {
      return submitted;
    } else if ( this.responseState === 'answered' ) {
      return thankYouNote;
    } else {
      return survey;
    }
  }
}
