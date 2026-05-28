const https = require('https');
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAwJDIlRvgvi5xWPhFBkon_R6Ca60jPxLg"; // User's key from .env snapshot
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.models) {
        console.log("Available models:");
        parsed.models.forEach(m => {
          console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(', ')})`);
        });
      } else {
        console.log("Response:", data);
      }
    } catch (e) {
      console.log("Error parsing:", data);
    }
  });
}).on('error', console.error);
