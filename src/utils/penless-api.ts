export async function callPenlessApi(url: string, data: any, sync: boolean = true) {
  const response = await fetch(`${process.env.WORKFLOW_EXECUTION_SERVER}${url}?sync=${sync}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.PENLESS_API_TOKEN ?? ''
    },
    body: JSON.stringify(data),
  });
  if(response.ok){
    const json = await response.json();
    return json;
  } else {
    throw new Error(response.statusText);
  }
}