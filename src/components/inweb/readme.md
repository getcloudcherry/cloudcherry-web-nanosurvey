# cc-inweb



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute           | Description                       | Type                               | Default                                                                                       |
| --------------------- | ------------------- | --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `conditionalThankYou` | --                  |                                   | `{ 'yes': string; 'no': string; }` | `{       yes: 'Thank you for your response!',       no: 'Thank you for your response!'     }` |
| `cookieId`            | `cookie-id`         |                                   | `string`                           | `undefined`                                                                                   |
| `doNotPost`           | `do-not-post`       |                                   | `boolean`                          | `false`                                                                                       |
| `icons`               | `icons`             |                                   | `"hide" \| "show"`                 | `'show'`                                                                                      |
| `prefills`            | `prefills`          | prefills                          | `any`                              | `undefined`                                                                                   |
| `question`            | `question`          |                                   | `string`                           | `'Was this helpful?'`                                                                         |
| `questionId`          | `question-id`       | Question-Id to post responses for | `string`                           | `undefined`                                                                                   |
| `throttleForDays`     | `throttle-for-days` |                                   | `number`                           | `3`                                                                                           |
| `token`               | `token`             | token to submit responses         | `string`                           | `undefined`                                                                                   |


## Events

| Event               | Description | Detail |
| ------------------- | ----------- | ------ |
| `cc-inweb-response` |             | void   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
