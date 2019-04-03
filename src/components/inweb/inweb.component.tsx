import {
  Component,
  Prop,
  Event,
  EventEmitter,
  State,
  Element
} from "@stencil/core";
import { sendRequest } from "../../utils/utils";

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

@Component({
  tag: "cc-inweb",
  styleUrl: "inweb.component.scss",
  shadow: true
})
export class Inweb {
  /**
   * token to submit responses
   */
  @Prop() token: string;
  /**
   * Configure throttling duration
   */
  @Prop() throttleForDays = 3;
  /**
   * Question-Id to post responses for
   */
  @Prop() questionId: string;
  /**
   * Optionaly hide the survey after submission
   */
  @Prop() hideAfterSubmission = false;
  /**
   * Use icons or text based options
   */
  @Prop() icons: "show" | "hide" = "show";
  /**
   * prefills
   */
  @Prop() prefills: any;
  /**
   * Use Custom key for managing throttling
   */
  @Prop() cookieId: string;
  /**
   * Question text that will be shown to the user
   */
  @Prop() question = "Was this helpful?";

  @Element() el;
  /**
   * Show conditional thank you message based on the response
   */
  @Prop() conditionalThankYou: {
    yes: string;
    no: string;
  } = {
    yes: "Thank you for your response!",
    no: "Thank you for your response!"
  };
  /**
   * Opt out of sending response to server. Handle in event hooks
   */
  @Prop() doNotPost = false;

  @State() responseState: "init" | "answered" | "submitted" = "init";
  @Event({
    eventName: "cc-inweb-response"
  })
  responded: EventEmitter;
  answeredNow = false;
  @State() lastAnswer = null;

  submit(response: boolean) {
    this.answeredNow = true;
    let responses = [];
    let _response = {
      questionId: this.questionId,
      questionText: this.question,
      textInput: response ? "Yes" : "No",
      numberInput: null
    };
    let prefills = [];
    if (this.prefills) {
      Object.keys(this.prefills).forEach(x => {
        prefills.push({
          questionId: x,
          questionText: null,
          textInput:
            typeof this.prefills[x] === "string" ? this.prefills[x] : null,
          numberInput:
            typeof this.prefills[x] === "number" ? this.prefills[x] : null
        });
      });
    }
    responses.push(...prefills, _response);

    let payload = {
      surveyClient: "Inweb",
      responses
    };

    this.responded.emit({
      question: this.question,
      response: response,
      responseAsAnswer: _response,
      prefills: this.prefills
    });

    if (this.token && !this.doNotPost) {
      this.responseState = "answered";
      sendRequest(this.token, payload).then(
        response => {
          console.log(response);
          if (response) {
            this.responseState = "submitted";
            this.createCookie(
              this.cookieId || this.el.id,
              _response.textInput,
              this.throttleForDays
            );
          }
        },
        err => {
          console.error("Unable to submit response", err);
          this.responseState = "init";
        }
      );
    }
  }

  createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      var expires = "; expires=" + date.toUTCString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  getOptions() {
    if (this.icons === "hide") {
      return (
        <div class="options">
          <span onClick={() => this.submit(true)}>Yes</span>
          <span onClick={() => this.submit(false)}>No</span>
        </div>
      );
    } else {
      return (
        <div class="options">
          <img
            src="https://cx.getcloudcherry.com/microsurvey-assets/up.svg"
            onClick={() => this.submit(true)}
          />
          <img
            src="https://cx.getcloudcherry.com/microsurvey-assets/down.svg"
            onClick={() => this.submit(false)}
          />
        </div>
      );
    }
  }

  render() {
    const survey = (
      <div class="container">
        <div class="question">{this.question}</div>
        {this.getOptions()}
      </div>
    );

    const cookieSet = this.readCookie(this.cookieId || this.el.id);

    let thankYouNote = <div />;
    if (cookieSet) {
      thankYouNote = (
        <div class="text">
          {this.conditionalThankYou[cookieSet.toLowerCase()]}
        </div>
      );
    }

    const submitted = <div class="text">Saving your response..</div>;

    if (this.responseState === "submitted" || cookieSet) {
      if (!this.hideAfterSubmission) {
        return thankYouNote;
      } else if (!this.answeredNow) {
        return <div />;
      } else if (this.answeredNow) {
        return thankYouNote;
      }
    } else if (this.responseState === "answered") {
      if (!this.hideAfterSubmission) {
        return thankYouNote;
      } else {
        return submitted;
      }
    } else {
      return survey;
    }
  }
}
