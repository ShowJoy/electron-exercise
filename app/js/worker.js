onmessage = (e) => {
  console.log('Message received from index.js');
  let workderResult = 'result: ' + (e.data[0] * e.data[1]);
  console.log('posting message back to main script');
  postMessage(workderResult);
}
onmessage = (e) => {
  console.log('Message received from index.js');
  let workderResult = 'result: ' + (e.data[0] * e.data[1]);
  console.log('posting message back to main script');
  postMessage(workderResult);
}
