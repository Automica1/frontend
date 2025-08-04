// components/Examples.tsx
import React, { useState } from 'react';
import { ApiConfig } from './types';

interface ExamplesProps {
  solution: { title: string };
  apiConfig: ApiConfig;
  createdApiKey: string;
}

interface CodeExample {
  id: string;
  label: string;
  code: string;
}

export const Examples: React.FC<ExamplesProps> = ({ solution, apiConfig, createdApiKey }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);

  const getCodeExamples = (): CodeExample[] => [
    {
      id: 'curl',
      label: 'cURL',
      code: `curl -X POST "${apiConfig.endpoint}" \\
  -H "Authorization: Bearer ${createdApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(apiConfig.requestBody)}'`
    },
    {
      id: 'javascript',
      label: 'JavaScript (Fetch)',
      code: `fetch('${apiConfig.endpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${createdApiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(apiConfig.requestBody, null, 4)})
})
.then(res => res.json())
.then(data => console.log(data));`
    },
    {
      id: 'nodejs',
      label: 'Node.js (axios)',
      code: `const axios = require('axios');

const response = await axios.post('${apiConfig.endpoint}', ${JSON.stringify(apiConfig.requestBody, null, 4)}, {
  headers: {
    'Authorization': 'Bearer ${createdApiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`
    },
    {
      id: 'python',
      label: 'Python (requests)',
      code: `import requests

url = '${apiConfig.endpoint}'
headers = {
    'Authorization': 'Bearer ${createdApiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
}
data = ${JSON.stringify(apiConfig.requestBody, null, 4)}

response = requests.post(url, json=data, headers=headers)
print(response.json())`
    },
    {
      id: 'java',
      label: 'Java (OkHttp)',
      code: `import okhttp3.*;
import java.io.IOException;

public class ApiExample {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();
        
        MediaType JSON = MediaType.get("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(JSON, ${JSON.stringify(JSON.stringify(apiConfig.requestBody))});
        
        Request request = new Request.Builder()
            .url("${apiConfig.endpoint}")
            .post(body)
            .addHeader("Authorization", "Bearer ${createdApiKey || 'YOUR_API_KEY'}")
            .addHeader("Content-Type", "application/json")
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.body().string());
        }
    }
}`
    },
    {
      id: 'go',
      label: 'Go',
      code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "${apiConfig.endpoint}"
    data := ${JSON.stringify(apiConfig.requestBody, null, 4)}
    
    jsonData, err := json.Marshal(data)
    if err != nil {
        panic(err)
    }
    
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }
    
    req.Header.Set("Authorization", "Bearer ${createdApiKey || 'YOUR_API_KEY'}")
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    fmt.Println(string(body))
}`
    },
    {
      id: 'rust',
      label: 'Rust (reqwest)',
      code: `use reqwest;
use serde_json::json;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let data = json!(${JSON.stringify(apiConfig.requestBody, null, 8)});
    
    let response = client
        .post("${apiConfig.endpoint}")
        .header("Authorization", "Bearer ${createdApiKey || 'YOUR_API_KEY'}")
        .header("Content-Type", "application/json")
        .json(&data)
        .send()
        .await?;
    
    let result: serde_json::Value = response.json().await?;
    println!("{:#}", result);
    
    Ok(())
}`
    },
    {
      id: 'php',
      label: 'PHP (cURL)',
      code: `<?php

$url = '${apiConfig.endpoint}';
$data = ${JSON.stringify(apiConfig.requestBody, null, 4)};

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ${createdApiKey || 'YOUR_API_KEY'}',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;

?>`
    },
    {
      id: 'csharp',
      label: 'C# (HttpClient)',
      code: `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

class Program
{
    private static readonly HttpClient client = new HttpClient();
    
    static async Task Main(string[] args)
    {
        var data = ${JSON.stringify(apiConfig.requestBody, null, 12)};
        
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        client.DefaultRequestHeaders.Add("Authorization", "Bearer ${createdApiKey || 'YOUR_API_KEY'}");
        
        var response = await client.PostAsync("${apiConfig.endpoint}", content);
        var result = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine(result);
    }
}`
    },
    {
      id: 'ruby',
      label: 'Ruby (Net::HTTP)',
      code: `require 'net/http'
require 'json'
require 'uri'

uri = URI('${apiConfig.endpoint}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Bearer ${createdApiKey || 'YOUR_API_KEY'}'
request['Content-Type'] = 'application/json'
request.body = ${JSON.stringify(apiConfig.requestBody, null, 2)}.to_json

response = http.request(request)
puts response.body`
    },
    {
      id: 'swift',
      label: 'Swift (URLSession)',
      code: `import Foundation

let url = URL(string: "${apiConfig.endpoint}")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer ${createdApiKey || 'YOUR_API_KEY'}", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let data = ${JSON.stringify(apiConfig.requestBody, null, 4)}

do {
    request.httpBody = try JSONSerialization.data(withJSONObject: data)
    
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let data = data {
            print(String(data: data, encoding: .utf8) ?? "")
        }
    }
    task.resume()
} catch {
    print("Error: \\(error)")
}`
    },
    {
      id: 'kotlin',
      label: 'Kotlin (OkHttp)',
      code: `import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

fun main() {
    val client = OkHttpClient()
    
    val json = """${JSON.stringify(apiConfig.requestBody)}"""
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val body = json.toRequestBody(mediaType)
    
    val request = Request.Builder()
        .url("${apiConfig.endpoint}")
        .post(body)
        .addHeader("Authorization", "Bearer ${createdApiKey || 'YOUR_API_KEY'}")
        .addHeader("Content-Type", "application/json")
        .build()
    
    client.newCall(request).execute().use { response ->
        println(response.body?.string())
    }
}`
    }
  ];

  const codeExamples = getCodeExamples();
  const selectedExample = codeExamples.find(ex => ex.id === selectedLanguage) || codeExamples[0];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full font-semibold text-sm flex-shrink-0 mt-1">
          2
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Make Your First Request</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Verify signatures across multiple document images. Use curl or any HTTP client to make your first API call.
          </p>
        </div>
      </div>

      {/* Code Block Container */}
      <div className="ml-12">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {/* Header with Language Selector and Copy Button */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-700 text-slate-200 text-sm rounded px-3 py-1 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                {codeExamples.map((example) => (
                  <option key={example.id} value={example.id} className="bg-slate-800">
                    {example.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 text-sm transition-colors p-2 hover:bg-slate-700/50 rounded"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="relative">
            <pre className="text-sm text-slate-300 font-mono p-6 overflow-x-auto bg-slate-900/30">
              <code>{selectedExample.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};