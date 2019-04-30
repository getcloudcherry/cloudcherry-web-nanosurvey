export function format(first: string, middle: string, last: string): string {
  return (
    (first || "") + (middle ? ` ${middle}` : "") + (last ? ` ${last}` : "")
  );
}

export const API = "https://api.getcloudcherry.com/api/";
export const PLAYGROUNDAPI = "https://api-playground.getcloudcherry.com/api/";
function getHeaders(method: "get" | "post", body?: any) {
  let options = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };
  if (method === "post") {
    options["body"] = JSON.stringify(body);
  }

  return options;
}

export async function sendPostRequest(token, response) {
  let url = `${API}surveybytoken/${token}`;

  let options = getHeaders("post", response);

  return fetch(url, options);
}

export async function postPartial(partialId, response, complete) {
  let url = `${API}PartialSurvey/${partialId}/${complete}`;

  let options = getHeaders("post", response);

  return fetch(url, options);
}

export async function sendGetRequest(token) {
  let url = `${API}surveybytoken/${token}`;

  let options = getHeaders("get");

  return fetch(url, options);
}
