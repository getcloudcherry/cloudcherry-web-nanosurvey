![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Inweb Survey

Web component as a channel for CEM for [CloudCherry](https://cloudcherry.com) users. Works great from within a webpage.

## Getting Started

To start using this channel within your web application, follow one of below methods.

### Script Tag

- Put a script tag similar to this `<script src='https://unpkg.com/inweb-survey@0.2.0/dist/inweb.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc.

### Node Modules

- `npm install inweb-survey`
- Put a script tag similar to this <script src='node_modules/inweb-survey/dist/inweb.js'></script> in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc.

### In a stencil-app-starter app

- Run `npm install inweb-survey --save`
- Add an import to the npm packages: `import inweb;`
- Then you can use the element anywhere in your template, JSX, html etc.

## Using this component

```
<cc-inweb id="widget-usability" question="How are you today?" token="PC-56874" question-id='5c272306c3d98742b0f7d577'>
</cc-inweb>
```

- <b>question</b> will be shown to user with thumbs up and down
- <b>token</b> - survey token from CloudCherry CEM platform
- <b>question-id</b> - id of the question from CloudCherry CEM platform

### Prefill user information

Below the html tag, add the following code in a script tag

```
<script>
    // Sample usage for a section in a page
    // Avoid using inweb as variable name,it overwrites the global sdk

    var _inweb = document.querySelector('#widget-usability');

    _inweb.prefills = {
      '59f0762ed50981ce6442dab4': 'Alex',
      '5c272306c3d98742b0f7d576': 'Widgets',
    }
</script>
```

- <b>prefills</b> is a dictionary with keys as question ids from CloudCherry CEM Platform and values are the prefill answers
- These prefills will be submitted along with users response.

### listen to response submission event

Every interaction to the component will emit an event on submission. Listen for <b>cc-inweb-response</b> event on the document as shown below

```
<script>
    document.addEventListener('cc-inweb-response', function ($event) {
      if($event.target.attributes.id === 'widget-usability'){
        <!-- react to response submission -->
      }
    })
</script>
```

`$event.detail` has the following payload

- <b>question</b> has the current question shown to us
- <b>response</b> is the user's choice of the answer. It would be 'true' or 'false'
- <b>prefills</b> prefills that was submitted along with response
- <b>responseAsAnswer</b> response as an answer format suitable for Cloudcherry CEM platform

### Conditional Thank you text

Show different thank you texts based on user's response. Below script sets the property to the already added component.

```
<script>
  _inweb.conditionalThankYou = {
    'yes': 'Thank you for your positive feedback',
    'no': 'Sorry for the inconvinience'
  }
</script>
```

### Hide icons

Not fond of thumbs? you can now show plain text instead of icons. Set the property 'icons' to 'hide'. This can be set in the html as property or set via Javascript

```
<script>
  _inweb.icons = 'hide';
</script>
```

### Set a different identifier for cookie

You can set different cookie property for the component to use. Set in html using 'cookie-id' attribute or use the property 'cookieId' in JS

```
<script>
  _inweb.cookieId="my-cookie-name";
</script>

```

### Throttle Survey for varying duration

Surveys are throttled by 3 days by default. You can set the attribute 'throttle-for-days' in html or set in Javascript using 'throttleForDays';

```
<script>
  _inweb.throttleForDays = 30;
</script>
```

### Hide after submission

While throttling, you can choose to show the survey or hide it.

```
<script>
  _inweb.hideAfterSubmission = true;
</script>
```

## Show followup question as drop down

You can show follow up options from each answer. This will show up once user answers a question. Add a followup question to post the response to.

```
_inweb.followUpQuestions = {
        Yes: ["Content", "Right to the point!"],
        No: ["Too Lengthy", "Does not makes sense"]
      };
_inweb.followUpQuestionId = "5c272306c3d98742b0f7d577";
```

If you need these options to be recorded as two different questions, use the following syntax.

```
_inweb.followUpQuestions = {
        Yes: {
          id: "5c272306c3d98742b0f7d577", // Positive followup question id
          multiSelect: ["Content", "Right to the point!"]
        },
        No: {
          id: "5c272306c3d98742b0f7d578", // Negative followup question id
          multiSelect: ["Too Lengthy", "Does not makes sense"]
        }
      };
_inweb.followUpQuestionId = "5c272306c3d98742b0f7d577";
```

## Use survey configuration from dashboard

You can use the survey configuration from the CloudCherry dashboard. It will pick the first question (primary) that is supported and render it inline."Star-5", "Smile-5", "Select".
Any following Single Select question with tag 'follow-up' will be take as follow up question. You can configure the conditions in the platform to show different followup options.
A follow up question can have only on condition to it (dependent on primary question). You will also be able to take advantage of partial submission (if enabled from dashboard).

```
 <cc-inweb id="feedback" use-token="true" token="MR-13286"></cc-inweb>
```

## Customize the component for your brand

Use css variables to set custom styles to the component

| Variable name            | Functionality           | Default                        |
| ------------------------ | :---------------------- | ------------------------------ |
| `--cc-inweb-color`       | Text color              | #6a6a6a                        |
| `--cc-inweb-font-weight` | Font Weight             | 400                            |
| `--cc-inweb-font-size`   | Font Size               | 15px                           |
| `--cc-inweb-font-style`  | Font Style for text     | italic                         |
| `--cc-inweb-yes-color`   | Color for Yes icon/text | `--cc-inweb-color` or #6a6a6a  |
| `--cc-inweb-no-color`    | Color for No icon/text  | `--cc-inweb-color` or #6a6a6a  |
| `--cc-inweb-icon-size`   | Size of icons           | `--cc-inweb-font-size` or 15px |

### Usage

Set style across the web page

```
<body style="--cc-inweb-color:blue">
</body>
```

Set style for one widget

```
<cc-inweb style="--cc-inweb-color: blue"></cc-inweb>

<cc-inweb style="--cc-inweb-color: red"></cc-inweb>
```
