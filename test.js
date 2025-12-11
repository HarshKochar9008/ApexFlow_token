import fetch from "node-fetch";

const API_KEY = "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";

async function test() {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "user", content: "Say Hello" }
      ]
    })
  });

  const data = await res.json();
  console.log(data);
}

test();
