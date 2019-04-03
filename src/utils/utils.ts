
export function format( first: string, middle: string, last: string ): string {
  return (
    ( first || '' ) +
    ( middle ? ` ${ middle }` : '' ) +
    ( last ? ` ${ last }` : '' )
  );
}

export const API = 'https://api.getcloudcherry.com/api/surveybytoken/'
export const PLAYGROUNDAPI = 'https://api-playground.getcloudcherry.com/api/surveybytoken/'

export async function sendRequest( token, response ) {

  let url = `${ API }${ token }`;

  let options = {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( response )
  }

  return fetch( url, options );
}