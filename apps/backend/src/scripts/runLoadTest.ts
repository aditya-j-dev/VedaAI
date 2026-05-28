import autocannon from 'autocannon';

const url = process.env.BACKEND_URL || 'http://localhost:4000';

const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 2); // 2 years in the future

const body = JSON.stringify({
  title: 'Load Test Assignment',
  subject: 'Science',
  grade: 'Class 8th',
  dueDate: futureDate.toISOString(),
  sections: JSON.stringify([
    {
      type: 'Multiple Choice Questions',
      numQuestions: 5,
      marksPerQuestion: 2
    }
  ]),
  additionalInfo: 'Load testing VedaAI'
});

console.log(`🚀 Starting load test against ${url}/api/assignments...`);
console.log(`Concurrency: 50 | Duration: 20s`);

const instance = autocannon({
  url: `${url}/api/assignments`,
  connections: 50,
  duration: 20,
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-load-test': 'true'
  },
  body
}, (err: Error | null, result: autocannon.Result) => {
  if (err) {
    console.error('❌ Error running load test:', err);
    return;
  }
  console.log('\n✨ Load test completed successfully!');
  console.log('--------------------------------------------------');
  console.log(`Total Requests Sent:   ${result.requests.sent}`);
  console.log(`Total Throughput:      ${result.throughput.total} bytes`);
  console.log(`Average Latency:       ${result.latency.average} ms`);
  console.log(`Max Latency:           ${result.latency.max} ms`);
  console.log(`Min Latency (p2.5):    ${result.latency.min} ms`);
  console.log(`1xx:                   ${result['1xx']}`);
  console.log(`2xx:                   ${result['2xx']}`);
  console.log(`3xx:                   ${result['3xx']}`);
  console.log(`4xx:                   ${result['4xx']}`);
  console.log(`5xx:                   ${result['5xx']}`);
  console.log('--------------------------------------------------');
});

autocannon.track(instance, { renderProgressBar: true });
