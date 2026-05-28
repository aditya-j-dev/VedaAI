const url = 'http://localhost:4000/api/assignments';

const body = JSON.stringify({
  title: 'Load Test Assignment',
  subject: 'Science',
  grade: 'Class 8th',
  dueDate: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days in future
  sections: JSON.stringify([
    {
      type: 'Multiple Choice Questions',
      numQuestions: 5,
      marksPerQuestion: 2
    }
  ]),
  additionalInfo: 'Load testing VedaAI'
});

async function run() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-load-test': 'true'
      },
      body
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
