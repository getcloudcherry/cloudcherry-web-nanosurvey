import { Component, Host, h, Prop, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "cc-multi-line",
  styleUrl: "multi-line.scss",
  shadow: true
})
export class MultiLine {
  /** Question to ask the user for open text */
  @Prop() question: string;
  @Prop() placeholder: string = "Enter your response here";
  value;
  answerSubmitted = false;

  @Event({
    eventName: "multilineAnswered"
  })
  answered: EventEmitter;

  emitResponse() {
    this.answerSubmitted = true;
    this.answered.emit({
      text: this.value
    });
  }

  handleInputEvent(event) {
    this.value = event.target.value;
  }

  render() {
    return (
      <Host>
        <slot>
          <div class="question-text">{this.question}</div>
          <div class="input-container">
            <textarea
              placeholder={this.placeholder}
              autoFocus
              onInput={event => this.handleInputEvent(event)}
            ></textarea>
          </div>
          <button onClick={() => this.emitResponse()}>Submit</button>
        </slot>
      </Host>
    );
  }
}
