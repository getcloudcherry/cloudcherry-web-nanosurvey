# cc-inweb



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description                                                  | Type                           | Default                                                                                 |
| --------------------- | ----------------------- | ------------------------------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| `conditionalThankYou` | --                      | Show conditional thank you message based on the response     | `{ yes: string; no: string; }` | `{     yes: "Thank you for your response!",     no: "Thank you for your response!"   }` |
| `cookieId`            | `cookie-id`             | Use Custom key for managing throttling                       | `string`                       | `undefined`                                                                             |
| `customStyle`         | `custom-style`          |                                                              | `any`                          | `undefined`                                                                             |
| `doNotPost`           | `do-not-post`           | Opt out of sending response to server. Handle in event hooks | `boolean`                      | `false`                                                                                 |
| `hideAfterSubmission` | `hide-after-submission` | Optionaly hide the survey after submission                   | `boolean`                      | `false`                                                                                 |
| `icons`               | `icons`                 | Use icons or text based options                              | `"hide" \| "show"`             | `"show"`                                                                                |
| `prefills`            | `prefills`              | prefills                                                     | `any`                          | `undefined`                                                                             |
| `question`            | `question`              | Question text that will be shown to the user                 | `string`                       | `"Was this helpful?"`                                                                   |
| `questionId`          | `question-id`           | Question-Id to post responses for                            | `string`                       | `undefined`                                                                             |
| `throttleForDays`     | `throttle-for-days`     | Configure throttling duration                                | `number`                       | `3`                                                                                     |
| `token`               | `token`                 | token to submit responses                                    | `string`                       | `undefined`                                                                             |


## Events

| Event               | Description | Type                |
| ------------------- | ----------- | ------------------- |
| `cc-inweb-response` |             | `CustomEvent<void>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
