import {
  Component,
  Prop,
  Event,
  EventEmitter,
  State,
  Element,
  h,
  Watch,
  Listen
} from "@stencil/core";
import {
  sendPostRequest,
  sendGetRequest,
  postPartial
} from "../../utils/utils";
import { Settings } from "../../types/settings";
import { SurveyResponse, Question } from "../../types/state";
import { Condition } from "../../types/question";
const SUPPORTED_QUESTIONS = ["Star-5", "Smile-5", "Select"];
const IMAGE_URL = "https://cx.getcloudcherry.com/survey-assets/v1/";

const IMAGE_NAMES = {
  "Star-5": {
    star: "star.svg",
    star_on: "star_on.svg"
  },
  "Smile-5": {
    smile: [
      "extremelyunhappy.svg",
      "unhappy.svg",
      "neutral.svg",
      "happy.svg",
      "extremelyhappy.svg"
    ],
    smile_on: [
      "extremelyunhappy_on.svg",
      "unhappy_on.svg",
      "neutral_on.svg",
      "happy_on.svg",
      "extremelyhappy_on.svg"
    ]
  }
};

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
   * Optionally hide the survey after submission
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
  _cookieId: string = null;
  /**
   * Use Custom key for managing throttling
   */
  @Prop() cookieId;

  @Watch("cookieId") resetState(newValue, oldValue) {
    this._cookieId = newValue;
    if (newValue !== oldValue) {
      this.initComponent();
    }
  }

  /**
   * Question text that will be shown to the user
   */
  @Prop() question = "Was this helpful?";

  /**
   * Question id for follow up response
   */
  @Prop() followUpQuestionId: string;

  @Watch("followUpQuestionId") setFollowupQuestionId(newValue) {
    this._followUpQuestionId = newValue;
  }

  _followUpQuestionId;

  @Prop() type = null;

  @Element() el;
  /**
   * Show conditional thank you message based on the response
   * works only for Yes/No question
   */
  @Prop() conditionalThankYou: {
    yes: string;
    no: string;
  } = {
    yes: "Thank you for your response!",
    no: "Thank you for your response!"
  };

  /**
   * Callbacks that will evaluate a condition for thank you text
   */
  @Prop() conditionalThankYouTextCallBack: any;
  /**
   * Opt out of sending response to server. Handle in event hooks
   */
  @Prop() doNotPost = false;

  /**
   * responseState
   *
   * init - showing the channel
   * answered -
   */
  @State() responseState: "init" | "answered" | "submitted" = "init";

  /**
   * Dictionary of followUp options to be asked
   */
  @Prop({ mutable: true }) followUpQuestions: any;

  @Event({
    eventName: "cc-inweb-response"
  })
  responded: EventEmitter;

  /**
   * Force the component to get token settings from server.
   * It will use the first valid question to show.
   *
   */
  @Prop()
  useToken = false;

  @Prop() position: "above" | "below" = "above";

  @State() followUpOptions: Array<string> = null;
  @State() _surveySettings: Settings;
  firstQuestion: Question;
  answeredNow = false;
  currentAnswer: number | string;
  temporaryAnswer: any;
  @State() showMultiline = false;

  @Prop() model;
  @State() ratingHovered = null;
  /**
   * Set survey settings from a central location. This will be handy to use same token with multiple survey within a page.
   */
  @Prop() surveySettings;

  @Watch("survey-settings") setSurveySettings(newValue) {
    this._surveySettings = newValue;
  }

  @State() lastAnswer = null;

  @Listen("multilineAnswered") multilineHandler(event: CustomEvent) {
    event.stopImmediatePropagation();
    this.submitFollowup(event.detail.text);
  }

  initComponent() {
    const cookieSet = this.readCookie(
      this._cookieId || this._cookieId || this.el.id
    );
    this.firstQuestion = null;
    this.answeredNow = false;
    this.currentAnswer = null;
    this.temporaryAnswer = null;
    this.responseState = "init";
    this._cookieId = this.cookieId;
    this._followUpQuestionId = this.followUpQuestionId;
    this._surveySettings = this.surveySettings;

    if (this.token && !cookieSet) {
      sendGetRequest(this.token)
        .then(x => x.json())
        .then((response: Settings) => {
          if (response) {
            this._surveySettings = response;
            if (this.useToken) {
              this.setFirstValidQuestion();
            }
          } else {
            // do not show the question
          }
        });
    }
  }

  componentWillLoad() {
    this.initComponent();
  }

  setFirstValidQuestion() {
    let validQuestions = this._surveySettings.questions
      .filter(x => !x.apiFill && !x.staffFill)
      .filter(x => SUPPORTED_QUESTIONS.indexOf(x.displayType) !== -1)
      .sort((a, b) => {
        return a.sequence - b.sequence;
      });
    this.firstQuestion = validQuestions[0];
    let followUpQuestions = validQuestions.filter(
      x =>
        x.id !== this.firstQuestion.id &&
        x.displayType === "Select" &&
        x.questionTags &&
        x.questionTags.indexOf("follow-up") !== -1
    );
    if (followUpQuestions) {
      this.followUpQuestions = {};
      followUpQuestions.forEach(x => {
        if (
          x &&
          x.conditionalFilter &&
          x.conditionalFilter.filterquestions &&
          x.conditionalFilter.filterquestions.length > 0
        ) {
          this.getTriggerValues(x.conditionalFilter.filterquestions).forEach(
            y => {
              this.followUpQuestions[y] = x;
            }
          );
        } else {
          this.followUpQuestions["default"] = x;
        }
      });
    }
  }

  getTriggerValues(filters: Condition[]) {
    let x = filters[0];
    let startRange = parseInt(
      this.firstQuestion.multiSelect[0].split("-")[0],
      10
    );
    let endRange = parseInt(
      this.firstQuestion.multiSelect[0].split("-")[1],
      10
    );
    if (!x) {
      if (this.isNumberType(this.firstQuestion)) {
        return this.getRange(startRange, endRange);
      }
    }
    if (x.questionId === this.firstQuestion.id) {
      if (this.isNumberType(this.firstQuestion)) {
        if (x.answerCheck[0] === "eq") {
          return [x.number];
        } else if (x.answerCheck[0] === "lt") {
          return this.getRange(startRange, x.number);
        } else if (x.answerCheck[0] === "gt") {
          return this.getRange(x.number, endRange);
        }
      } else {
        return x.answerCheck;
      }
    }
  }

  getRange(start, end) {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  submit(response: number | string, followUpAnswer?: string) {
    this.answeredNow = true;
    this.currentAnswer = response;
    let responses = [];
    let _response = this.compileResponse(response);
    let followUpResponse;

    if (
      followUpAnswer &&
      (this.followUpQuestionId ||
        (this.followUpQuestions &&
          (this.followUpQuestions[response] ||
            this.followUpQuestions["default"])))
    ) {
      followUpResponse = this.compileFollowupResponse(response, followUpAnswer);
    }
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

    if (followUpResponse) {
      responses.push(followUpResponse);
    }

    let payload = {
      surveyClient: "Inweb",
      responseDateTime: new Date(),
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
      // flush partial
      if (this._surveySettings && this._surveySettings.partialResponseId) {
        let flush = true;
        postPartial(this._surveySettings.partialResponseId, _response, flush);
      }
      sendPostRequest(this.token, payload).then(
        submittedResponse => {
          console.log(submittedResponse);
          if (submittedResponse) {
            this.responseState = "submitted";
            this.createCookie(
              this.cookieId || this._cookieId || this.el.id,
              response,
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

  compileFollowupResponse(firstResponse, followUpResponse): SurveyResponse {
    let questionId;
    if (this.followUpQuestionId) {
      questionId = this.followUpQuestionId;
    } else if (this.followUpQuestions[firstResponse]) {
      questionId = this.followUpQuestions[firstResponse].id;
    } else if (this.followUpQuestions["default"]) {
      questionId = this.followUpQuestions["default"].id;
    }

    if (questionId) {
      return {
        questionId,
        questionText: "Followup question",
        textInput: followUpResponse,
        numberInput: null
      };
    }
  }

  isNumberType(type) {
    if (["Scale", "Smile-5", "Star-5"].indexOf(type) !== -1) {
      return true;
    }
  }

  /**
   * Creates a response object as per the question type
   *
   * @param response {boolean | number} primary response
   *
   *
   */
  compileResponse(response): SurveyResponse {
    if (this.useToken && this._surveySettings) {
      let isNumberType = this.isNumberType(this.firstQuestion.displayType);
      return {
        questionId: this.firstQuestion.id,
        questionText: this.firstQuestion.text,
        textInput: !isNumberType ? response : null,
        numberInput: isNumberType ? response : null
      };
    }
    let result;
    if (typeof response === "boolean") {
      result = response ? "Yes" : "No";
    } else {
      result = response;
    }
    return {
      questionId: this.questionId,
      questionText: this.question,
      textInput: typeof result === "string" ? result : null,
      numberInput: typeof result === "number" ? result : null
    };
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

  getStars(question: Question, selected?: number) {
    let displayLegend = [];
    if (question && question.displayLegend) {
      displayLegend = question.displayLegend;
    }
    return (
      <div class="star-container">
        {[1, 2, 3, 4, 5].map(i => {
          let imgUrl = `${IMAGE_URL}${IMAGE_NAMES["Star-5"].star}`;
          if (i <= selected) {
            imgUrl = `${IMAGE_URL}${IMAGE_NAMES["Star-5"].star_on}`;
          }

          let title = this.getLegendAsTitle(i, displayLegend);

          return (
            <img
              class="star"
              src={imgUrl}
              onClick={() => this.validateAndSubmit(i)}
              title={title}
              onMouseOver={() => this.reRenderForRating(i)}
              onMouseOut={() => this.reRenderForRating(null)}
            />
          );
        })}
      </div>
    );
  }

  reRenderForRating(hovered) {
    this.ratingHovered = hovered;
    this.render();
    return null;
  }

  getSmiles(question: Question, selected?: number) {
    let displayLegend = [];
    if (question && question.displayLegend) {
      displayLegend = question.displayLegend;
    }

    return (
      <div class="smile-container">
        {[1, 2, 3, 4, 5].map(i => {
          let imgUrl;
          if (i === selected) {
            imgUrl = `${IMAGE_URL}${IMAGE_NAMES["Smile-5"].smile_on[i - 1]}`;
          } else {
            imgUrl = `${IMAGE_URL}${IMAGE_NAMES["Smile-5"].smile[i - 1]}`;
          }

          let title = this.getLegendAsTitle(i, displayLegend);

          return (
            <img
              class="smile"
              src={imgUrl}
              onClick={() => this.validateAndSubmit(i)}
              title={title}
              onMouseOver={() => this.reRenderForRating(i)}
              onMouseOut={() => this.reRenderForRating(null)}
            />
          );
        })}
      </div>
    );
  }

  getLegendAsTitle(i, displayLegend) {
    let title;
    if (i === 1) {
      if (displayLegend && displayLegend[0]) {
        title = displayLegend[0];
      } else {
        title = "Low";
      }
    } else if (i === 5) {
      if (displayLegend && displayLegend[1]) {
        title = displayLegend[1];
      } else {
        title = "High";
      }
    }

    return title;
  }

  getSelectOptions(question: Question) {
    if (!question || !question.multiSelect) {
      return <div />;
    }
    return (
      <div class="select-container">
        <select onInput={event => this.submitSelect(event)}>
          <option value="null">Select a value</option>
          {question.multiSelect.map(x => {
            let y = x.split(";")[0];
            return <option value={y}>{y}</option>;
          })}
        </select>
      </div>
    );
  }

  submitSelect(event) {
    // console.log(event.target.value);
    this.validateAndSubmit(event.target.value);
  }

  getType(question) {
    if (question && question.displayType) {
      return question.displayType;
    } else if (this.type) {
      return this.type;
    }
  }

  getOptionsFor(question: Question) {
    if (this.getType(question) === "Star-5") {
      return this.getStars(
        question,
        this.ratingHovered || this.temporaryAnswer || this.model
      );
    } else if (this.getType(question) === "Smile-5") {
      return this.getSmiles(
        question,
        this.ratingHovered || this.temporaryAnswer || this.model
      );
    } else if (this.getType(question) === "Select") {
      return this.getSelectOptions(question);
    }
  }

  getOptions() {
    if (this.icons === "hide") {
      return (
        <div class="options">
          <div
            class="yes text-button"
            onClick={() => this.validateAndSubmit("Yes")}
          >
            <div class="button-background" />
            Yes
          </div>
          <div
            class="no text-button"
            onClick={() => this.validateAndSubmit("No")}
          >
            <div class="button-background" />
            No
          </div>
        </div>
      );
    } else {
      return (
        <div class="options">
          <div class="up" onClick={() => this.validateAndSubmit("Yes")}>
            {this.getUpSvg()}
          </div>
          <div class="down" onClick={() => this.validateAndSubmit("No")}>
            {this.getDownSvg()}
          </div>
        </div>
      );
    }
  }

  /**
   * Checks for followUp questions
   *
   * @param value {string | number} response collected
   */
  validateAndSubmit(value) {
    if (
      this.followUpQuestions &&
      this.followUpQuestions[value] &&
      this.followUpQuestions[value].displayType === "Multiline"
    ) {
      // for showing open text
      this.temporaryAnswer = value;
      this.showMultiline = true;
    } else if (
      this.followUpQuestions &&
      this.followUpQuestions[value] &&
      !this.followUpQuestions[value].multiSelect
    ) {
      this.temporaryAnswer = value;
      this.followUpOptions = this.followUpQuestions[value];
      this.showMultiline = false;
    } else if (
      this.followUpQuestions &&
      this.followUpQuestions[value] &&
      this.followUpQuestions[value].multiSelect
    ) {
      this.showMultiline = false;
      this.temporaryAnswer = value;
      this.followUpOptions = this.followUpQuestions[value].multiSelect;
    } else if (this.followUpQuestions && this.followUpQuestions["default"]) {
      this.temporaryAnswer = value;
      this.followUpOptions = this.followUpQuestions["default"].multiSelect;
    } else {
      this.showMultiline = false;
      this.followUpOptions = null;
      this.submit(value);
    }
  }

  getDownSvg() {
    return (
      <svg width="45px" height="45px" viewBox="0 0 45 45" version="1.1">
        <title>Down-line</title>
        <desc>Created with Sketch.</desc>
        <g
          id="Down-line"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M43.1961861,19.7051241 C44.0653246,20.8639751 44.4998939,22.2980537 44.4998939,24.00736 C44.4998939,25.7166662 43.8770108,27.2086865 42.631246,28.4834235 C41.3854812,29.7581605 39.8934596,30.3955283 38.1551825,30.3955283 L32.0712126,30.3955283 L32.2450403,30.6562699 C32.7665234,31.6992362 33.1431497,32.5394039 33.3749204,33.1767717 C33.7225758,34.277681 33.8964036,35.3785889 33.8964036,36.4794982 C33.8964036,39.0869139 33.3169774,41.0859325 32.1581265,42.4765542 C30.9992755,43.8671759 29.1740845,44.5624867 26.6825536,44.5624867 C24.7125057,44.5624867 23.3508562,42.6214111 22.5976024,38.7392584 C22.4237747,37.7542352 22.249947,37.0299522 22.0761192,36.5664121 C21.8443485,35.8131582 21.5546361,35.2627042 21.2069807,34.9150488 C20.6275545,34.3935657 19.7004743,33.2636856 18.4257373,31.5254084 C17.3827711,30.1927298 16.6005464,29.2366774 16.0790632,28.6572512 C15.2678677,27.7301697 14.6015277,27.1217727 14.0800446,26.8320603 L13.9062168,26.8320603 L13.9062168,27.8750265 C13.9062168,28.6282804 13.6309892,29.2801343 13.0805352,29.8305883 C12.5300812,30.3810422 11.8782273,30.6562699 11.1249735,30.6562699 L2.78124337,30.6562699 C2.02798951,30.6562699 1.3761356,30.3810422 0.825681625,29.8305883 C0.27522765,29.2801343 0,28.6282804 0,27.8750265 L0,5.62507957 C0,4.87182572 0.27522765,4.2199718 0.825681625,3.66951783 C1.3761356,3.11906385 2.02798951,2.8438362 2.78124337,2.8438362 L11.1249735,2.8438362 C11.8202843,2.8438362 12.4286813,3.07560693 12.9501644,3.53914705 L13.9062168,3.53914705 C14.485643,3.53914705 15.2099247,3.42326235 16.0790632,3.19149162 C16.6584894,3.01766391 17.5855696,2.7279515 18.8603066,2.32235307 C20.8882961,1.56909922 22.5106885,1.04761609 23.7274825,0.757903676 C25.6975303,0.294363557 27.5516921,0.0625928342 29.2899692,0.0625928342 L32.8534373,0.0625928342 C35.4029099,0.0625928342 37.3729578,0.772389761 38.7635795,2.19198229 C40.1542011,3.61157482 40.8205411,5.50919487 40.7625981,7.88483981 C41.399966,8.63809366 41.8635074,9.53620306 42.1532198,10.5791693 C42.4429322,11.6221356 42.5008752,12.6651018 42.3270475,13.7080681 C42.8485307,14.5192637 43.1817,15.4753161 43.3265569,16.5762253 C43.4714137,17.6771346 43.4279568,18.7201009 43.1961861,19.7051241 Z M11.1249735,27.8750265 L11.1249735,5.62507957 L2.78124337,5.62507957 L2.78124337,27.8750265 L11.1249735,27.8750265 Z M38.1551825,27.614285 C39.1402057,27.614285 39.9803734,27.2521435 40.6756843,26.5278618 C41.3709951,25.8035801 41.7186505,24.9923832 41.7186505,24.0942738 C41.7186505,23.1961644 41.5448228,22.4284245 41.1971674,21.7910567 C40.849512,21.1536888 40.3280289,20.7480904 39.632718,20.5742627 C40.0962581,20.2266073 40.4004566,19.6182103 40.5453135,18.7490717 C40.6901704,17.8799332 40.6467134,17.0107946 40.4149427,16.1416561 C40.183172,15.2725175 39.7486027,14.6930914 39.1112349,14.403379 C39.690661,13.4762974 39.8210318,12.4478172 39.5023472,11.3179371 C39.1836626,10.188057 38.6187226,9.42031836 37.807527,9.01471993 C38.1551825,6.87084439 37.8364979,5.27742415 36.8514746,4.23445789 C35.9823361,3.30737632 34.6496574,2.8438362 32.8534373,2.8438362 L29.2899692,2.8438362 C27.7255198,2.8438362 25.9582719,3.10457777 23.9882241,3.6260609 C22.8873148,3.91577331 21.3228654,4.4082856 19.2948759,5.10359644 C17.9621972,5.56713656 17.0351156,5.8568503 16.5136325,5.97273499 C15.5865509,6.2624474 14.8332984,6.40730427 14.2538723,6.40730427 L13.9062168,6.40730427 L13.9062168,24.0508169 L14.2538723,24.0508169 C15.0650678,24.0508169 16.0790632,24.6592139 17.2958572,25.8760079 C17.991168,26.6292617 19.0631051,27.9329695 20.5116698,29.7871313 C21.7284638,31.3515807 22.5976024,32.394547 23.1190855,32.9160301 C23.7564533,33.553398 24.2779365,34.3935657 24.6835349,35.4365319 C24.8573626,36.0159581 25.0601612,36.9430383 25.2919319,38.2177753 C25.5237026,39.1448569 25.6975303,39.8111955 25.813415,40.216794 C26.0451857,40.9121048 26.3348982,41.4335879 26.6825536,41.7812434 C28.5946584,41.7812434 29.8693954,41.1728464 30.5067632,39.9560524 C30.9123616,39.2607416 31.1151602,38.1018906 31.1151602,36.4794982 C31.1151602,35.6683027 30.9703033,34.8571058 30.6805909,34.0459102 C30.5067632,33.5244271 30.2025647,32.8291163 29.7679954,31.9599777 C29.3334262,31.0908392 29.0292277,30.4244992 28.8554,29.9609591 C28.5656875,29.2077052 28.4208307,28.4254805 28.4208307,27.614285 L38.1551825,27.614285 Z M9.03904095,23.7031615 C9.03904095,24.2825876 8.8362424,24.7750986 8.43064396,25.180697 C8.02504553,25.5862954 7.53253457,25.789094 6.95310842,25.789094 C6.37368228,25.789094 5.88117132,25.5862954 5.47557288,25.180697 C5.06997445,24.7750986 4.8671759,24.2825876 4.8671759,23.7031615 C4.8671759,23.1237353 5.06997445,22.6312244 5.47557288,22.2256259 C5.88117132,21.8200275 6.37368228,21.6172289 6.95310842,21.6172289 C7.53253457,21.6172289 8.02504553,21.8200275 8.43064396,22.2256259 C8.8362424,22.6312244 9.03904095,23.1237353 9.03904095,23.7031615 Z"
            id="thumbs-down-copy"
            fill="#000000"
          />
        </g>
      </svg>
    );
  }

  getUpSvg() {
    return (
      <svg width="45px" height="45px" viewBox="0 0 45 45" version="1.1">
        <title>Up-Line</title>
        <desc>Created with Sketch.</desc>
        <g
          id="Up-Line"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M43.6816406,25.1367188 C43.9160161,26.1328121 43.9599614,27.1874996 43.8134766,28.3007812 C43.6669917,29.4140629 43.3300781,30.3808598 42.8027344,31.2011719 C42.9785156,32.2558594 42.9199214,33.3105469 42.6269531,34.3652344 C42.3339848,35.4199219 41.8652339,36.3281246 41.2207031,37.0898438 C41.2792973,39.4921871 40.6054688,41.4111333 39.1992188,42.8466797 C37.7929688,44.2822261 35.8007808,45 33.2226562,45 L29.6191406,45 C27.8613281,45 25.9277344,44.7363281 23.8183594,44.2089844 C22.5878906,43.9160161 20.8886723,43.3886723 18.7207031,42.6269531 L16.0839844,41.7480469 C15.2636723,41.5136714 14.5898438,41.3964844 14.0625,41.3964844 L14.0625,42.1875 C14.0625,42.9492192 13.7841792,43.6083989 13.2275391,44.1650391 C12.6708989,44.7216792 12.0117192,45 11.25,45 L2.8125,45 C2.0507808,45 1.39160112,44.7216792 0.834960938,44.1650391 C0.27832076,43.6083989 0,42.9492192 0,42.1875 L0,19.6875 C0,18.9257808 0.27832076,18.2666011 0.834960938,17.7099609 C1.39160112,17.1533208 2.0507808,16.875 2.8125,16.875 L11.25,16.875 C12.2460933,16.875 13.0078125,17.2851567 13.5351562,18.1054688 C13.8281246,18.0468746 14.0625,17.9882817 14.2382812,17.9296875 C14.765625,17.6367192 15.4394536,17.0214848 16.2597656,16.0839844 C16.7871094,15.4980464 17.578125,14.5312496 18.6328125,13.1835938 C19.9218754,11.4257812 20.8593746,10.2832031 21.4453125,9.75585938 C21.796875,9.40429688 22.0898433,8.8476567 22.3242188,8.0859375 C22.5,7.61718795 22.6757812,6.88476518 22.8515625,5.88867188 C23.6132817,1.96289018 24.9902339,0 26.9824219,0 C29.5019536,0 31.3476567,0.703125 32.5195312,2.109375 C33.6914058,3.515625 34.2773438,5.53710938 34.2773438,8.17382812 C34.2773438,9.28710982 34.1015625,10.4003902 33.75,11.5136719 C33.5156246,12.1582027 33.1347656,13.0078125 32.6074219,14.0625 L32.4316406,14.3261719 L38.5839844,14.3261719 C40.3417969,14.3261719 41.8505864,14.9707027 43.1103516,16.2597656 C44.3701167,17.5488286 45,19.0576167 45,20.7861328 C45,22.5146489 44.5605469,23.9648442 43.6816406,25.1367188 Z M3,42 L11,42 L11,20 L3,20 L3,42 Z M39.9,24.2410714 C40.6,24.0669643 41.125,23.6607138 41.475,23.0223214 C41.825,22.383929 42,21.6149549 42,20.7154018 C42,19.8158487 41.65,19.0033478 40.95,18.2779018 C40.25,17.5524558 39.4041662,17.1897321 38.4125,17.1897321 L28.6125,17.1897321 C28.6125,16.3772326 28.7583338,15.5937504 29.05,14.8392857 C29.225,14.3750004 29.53125,13.7075893 29.96875,12.8370536 C30.40625,11.9665179 30.7125,11.2700893 30.8875,10.7477679 C31.1791662,9.9352683 31.325,9.12276741 31.325,8.31026786 C31.325,6.68526741 31.1208338,5.52455357 30.7125,4.828125 C30.0708338,3.609375 28.7875,3 26.8625,3 C26.5125,3.34821429 26.2208338,3.87053571 25.9875,4.56696429 C25.8708338,4.97321473 25.6958338,5.64062456 25.4625,6.56919643 C25.2291662,7.84598259 25.025,8.77455313 24.85,9.35491071 C24.4416662,10.3995536 23.93125,11.2265625 23.31875,11.8359375 C22.70625,12.4453125 21.7583338,13.5915183 20.475,15.2745536 C19.075,17.0736612 18.025,18.3214286 17.325,19.0178571 C16.1,20.178571 14.9916662,20.7589286 14,20.7589286 L14,38.4308036 C14.7,38.4308036 15.575,38.5758933 16.625,38.8660714 C17.2666662,39.0401786 18.3166662,39.3883929 19.775,39.9107143 C21.7583338,40.5491067 23.275,41.0133933 24.325,41.3035714 C26.1916662,41.7678567 27.9125,42 29.4875,42 L33.075,42 C34.8833338,42 36.225,41.5357147 37.1,40.6071429 C38.0916662,39.5625 38.4125,37.9665183 38.0625,35.8191964 C38.8791662,35.412946 39.4479162,34.6439732 39.76875,33.5122768 C40.0895838,32.3805804 39.9583338,31.3504469 39.375,30.421875 C40.0166662,30.1316969 40.4541662,29.5513393 40.6875,28.6808036 C40.9208338,27.8102679 40.9645838,26.9397321 40.81875,26.0691964 C40.6729162,25.1986607 40.3666662,24.5892857 39.9,24.2410714 Z M9,38 C9,38.555556 8.80555598,39.0277774 8.41666667,39.4166667 C8.02777735,39.805556 7.55555598,40 7,40 C6.44444402,40 5.97222265,39.805556 5.58333333,39.4166667 C5.19444402,39.0277774 5,38.555556 5,38 C5,37.444444 5.19444402,36.9722226 5.58333333,36.5833333 C5.97222265,36.194444 6.44444402,36 7,36 C7.55555598,36 8.02777735,36.194444 8.41666667,36.5833333 C8.80555598,36.9722226 9,37.444444 9,38 Z"
            id="thumbs-up"
            fill="#000000"
          />
        </g>
      </svg>
    );
  }

  getThankYouText(cookieSet) {
    let thankYouNote;
    if (cookieSet) {
      let submittedResponse = isNaN(cookieSet)
        ? cookieSet
        : parseInt(cookieSet, 10);
      if (this.conditionalThankYou[submittedResponse]) {
        thankYouNote = (
          <div class="thankyou text">
            {this.conditionalThankYou[submittedResponse]}
          </div>
        );
      }
    } else if (
      this.currentAnswer &&
      this.conditionalThankYou[this.currentAnswer]
    ) {
      thankYouNote = (
        <div class="thankyou text">
          {this.conditionalThankYou[this.currentAnswer]}
        </div>
      );
    }

    return (
      thankYouNote || (
        <div class="thankyou text">Thank you for your response!</div>
      )
    );
  }

  prepareSurveyFor(question: Question) {
    return (
      <div class="container">
        {!this.showMultiline ? (
          <div class="first-row">
            <div class="question">
              {question && question.text ? question.text : this.question}
            </div>
            <div>
              {this.getOptionsFor(question)}
              {this.followUpOptions ? (
                <div>
                  <div
                    class="cc-overlay"
                    onClick={() => {
                      this.dismissFollowup();
                    }}
                  />
                  <div class={`menu ${this.position}`}>
                    <div class="menu-item question-text">
                      {this.getFollowupQuestionText()}
                    </div>
                    {this.followUpOptions.map(x => {
                      return (
                        <div
                          class="menu-item"
                          onClick={() => this.submitFollowup(x)}
                        >
                          {x}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          <cc-multi-line
            question={this.getFollowupQuestionText()}
          ></cc-multi-line>
        )}
      </div>
    );
  }

  submitFollowup(value) {
    this.submit(this.temporaryAnswer, value);
    this.followUpOptions = null;
  }
  postPartial(flush = false) {
    let response = this.compileResponse(this.temporaryAnswer);
    postPartial(this._surveySettings.partialResponseId, response, flush);
  }

  dismissFollowup() {
    if (this._surveySettings && this._surveySettings.partialResponseId) {
      this.postPartial();
    } else {
      this.submit(this.temporaryAnswer);
    }
    this.followUpOptions = null;
  }

  getSurvey() {
    let survey;
    var that = this;
    function handleWindowClicks() {
      setTimeout(() => {
        if (that.followUpOptions) {
          that.dismissFollowup();
        }
      }, 100);

      document.body.removeEventListener("click", handleWindowClicks);
    }
    if (this.followUpOptions) {
      document.body.addEventListener("click", handleWindowClicks);
    }
    if (!this.useToken && !this.type) {
      survey = (
        <div class="container">
          {!this.showMultiline ? (
            <div class="first-row">
              <div class="question">{this.question}</div>
              <div>
                {this.getOptions()}
                {this.followUpOptions ? (
                  <div>
                    <div
                      class="cc-overlay"
                      onClick={() => {
                        this.dismissFollowup();
                      }}
                    />
                    <div class={`menu ${this.position}`}>
                      <div class="menu-item question-text">
                        {this.getFollowupQuestionText()}
                      </div>
                      {this.followUpOptions.map(x => {
                        return (
                          <div
                            class="menu-item"
                            onClick={() => this.submitFollowup(x)}
                          >
                            {x}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            <cc-multi-line
              class="second-row"
              question={this.getFollowupQuestionText()}
            ></cc-multi-line>
          )}
        </div>
      );
    } else if (this.type || (this._surveySettings && this.firstQuestion)) {
      return this.prepareSurveyFor(this.firstQuestion);
    }
    return survey;
  }

  getFollowupQuestionText() {
    if (this.followUpQuestions) {
      let question =
        this.followUpQuestions[this.temporaryAnswer] ||
        this.followUpQuestions["default"];
      if (question && question.text) {
        return question.text;
      } else if (this.temporaryAnswer === "Yes" || this.temporaryAnswer >= 4) {
        return "What did you like?";
      } else if (this.temporaryAnswer === "No" || this.temporaryAnswer < 4) {
        return "What did you dislike?";
      } else {
        return "Choose an reason for your rating.";
      }
    }
  }

  render() {
    const survey = this.getSurvey();

    const cookieSet = this.readCookie(
      this._cookieId || this._cookieId || this.el.id
    );

    const submitted = <div class="text">Saving your response..</div>;

    /****
     * answered - response collected from user and sent to server
     * submitted - posted response to server successfully
     *
     * if not to hide
     *  show thank you note
     * else if answered earlier
     *  show nothing
     * else if answered now
     *  show thank you text
     * */

    if (this.responseState === "submitted" || cookieSet) {
      if (!this.hideAfterSubmission) {
        return this.getThankYouText(cookieSet);
      } else if (!this.answeredNow) {
        return <div />;
      } else if (this.answeredNow) {
        return this.getThankYouText(cookieSet);
      }
    } else if (this.responseState === "answered") {
      if (this.hideAfterSubmission) {
        return this.getThankYouText(cookieSet);
      } else {
        return submitted;
      }
    } else {
      return survey;
    }
  }
}
