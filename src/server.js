/**
 * ElizaOS Vision Agent Server
 * This server exposes the Vision Agent functionality via a REST API
 */

import http from 'http';
import url from 'url';
import GoogleVisionAction from './actions/googleVisionAction.js';
import { OraAction } from './actions/oraAction.js';

// Set environment variables manually if dotenv fails
try {
  // Try to load environment variables from .env file
  import('dotenv/config').catch(err => {
    console.warn('Warning: dotenv package not available, using default environment variables');
  });
} catch (error) {
  console.warn('Warning: dotenv package not available, using default environment variables');
}

// Create a mock agent for handling actions
const mockAgent = {
  name: 'ElizaOS Vision Agent',
  executeAction: async (actionName, params) => {
    console.log(`Executing action: ${actionName}`);
    
    if (actionName === 'analyze_image') {
      const action = new GoogleVisionAction(mockAgent);
      return await action.execute(params);
    } else if (actionName === 'query_ora') {
      const action = new OraAction(mockAgent);
      return await action.execute(params);
    } else {
      throw new Error(`Unknown action: ${actionName}`);
    }
  }
};

// Helper function to parse JSON body from request
const parseRequestBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  try {
    // API endpoints
    if (path === '/api/analyze-image' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      
      if (!body.imageUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'imageUrl is required' }));
        return;
      }
      
      const result = await mockAgent.executeAction('analyze_image', {
        imageUrl: body.imageUrl,
        features: body.features || ['LABEL_DETECTION', 'TEXT_DETECTION', 'OBJECT_LOCALIZATION']
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
    
    if (path === '/api/query-ora' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      
      if (!body.imageAnalysis || !body.query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'imageAnalysis and query are required' }));
        return;
      }
      
      const result = await mockAgent.executeAction('query_ora', {
        imageAnalysis: body.imageAnalysis,
        query: body.query
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
    
    if (path === '/api/analyze-and-query' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      
      if (!body.imageUrl || !body.query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'imageUrl and query are required' }));
        return;
      }
      
      // Step 1: Analyze the image
      const imageAnalysis = await mockAgent.executeAction('analyze_image', {
        imageUrl: body.imageUrl,
        features: body.features || ['LABEL_DETECTION', 'TEXT_DETECTION', 'OBJECT_LOCALIZATION']
      });
      
      if (!imageAnalysis.success) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Failed to analyze image: ${imageAnalysis.error}` }));
        return;
      }
      
      // Step 2: Query ORA with the analysis results
      const oraResponse = await mockAgent.executeAction('query_ora', {
        imageAnalysis: imageAnalysis.data,
        query: body.query
      });
      
      // Log the responses for debugging
      console.log('Image Analysis Response:', JSON.stringify(imageAnalysis, null, 2));
      console.log('ORA Response:', JSON.stringify(oraResponse, null, 2));
      
      // Format the final response
      const finalResponse = {
        success: true,
        imageAnalysis: imageAnalysis.data,
        oraResponse: oraResponse.data || oraResponse
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(finalResponse));
      return;
    }
    
    // Serve a simple HTML page for the root path
    if (path === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ElizaOS Vision Agent</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .endpoint {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            pre {
              background: #eee;
              padding: 10px;
              border-radius: 3px;
              overflow-x: auto;
            }
            .try-it {
              margin-top: 30px;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            input, textarea, button {
              margin: 10px 0;
              padding: 8px;
              width: 100%;
            }
            button {
              background: #4CAF50;
              color: white;
              border: none;
              cursor: pointer;
              padding: 10px;
            }
            #result {
              white-space: pre-wrap;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              display: none;
            }
          </style>
        </head>
        <body>
          <h1>ElizaOS Vision Agent API</h1>
          <p>This server provides access to the ElizaOS Vision Agent functionality via a REST API.</p>
          
          <h2>Available Endpoints:</h2>
          
          <div class="endpoint">
            <h3>1. Analyze Image</h3>
            <p><strong>POST /api/analyze-image</strong></p>
            <p>Analyzes an image using Google Vision AI.</p>
            <p>Request body:</p>
            <pre>{
  "imageUrl": "https://example.com/image.jpg",
  "features": ["LABEL_DETECTION", "TEXT_DETECTION", "OBJECT_LOCALIZATION"] // optional
}</pre>
          </div>
          
          <div class="endpoint">
            <h3>2. Query ORA</h3>
            <p><strong>POST /api/query-ora</strong></p>
            <p>Queries the ORA API with image analysis data.</p>
            <p>Request body:</p>
            <pre>{
  "imageAnalysis": { /* Image analysis data */ },
  "query": "What can you tell me about this image?"
}</pre>
          </div>
          
          <div class="endpoint">
            <h3>3. Analyze and Query (Combined)</h3>
            <p><strong>POST /api/analyze-and-query</strong></p>
            <p>Analyzes an image and then queries ORA in a single request.</p>
            <p>Request body:</p>
            <pre>{
  "imageUrl": "https://example.com/image.jpg",
  "query": "What can you tell me about this image?",
  "features": ["LABEL_DETECTION", "TEXT_DETECTION", "OBJECT_LOCALIZATION"] // optional
}</pre>
          </div>
          
          <div class="try-it">
            <h2>Try it out:</h2>
            <p>Analyze an image and get ORA's response:</p>
            <input type="text" id="imageUrl" placeholder="Image URL (e.g., https://example.com/image.jpg)" value="">
            <input type="text" id="query" placeholder="Your question about the image" value="What can you tell me about this image?">
            <button onclick="analyzeAndQuery()">Analyze and Query</button>
            <div id="result"></div>
            
            <script>
              async function analyzeAndQuery() {
                const imageUrl = document.getElementById('imageUrl').value;
                const query = document.getElementById('query').value;
                const resultDiv = document.getElementById('result');
                
                if (!imageUrl || !query) {
                  alert('Please provide both an image URL and a query');
                  return;
                }
                
                resultDiv.textContent = 'Processing...';
                resultDiv.style.display = 'block';
                
                try {
                  const response = await fetch('/api/analyze-and-query', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl, query })
                  });
                  
                  const data = await response.json();
                  
                  if (response.ok) {
                    resultDiv.innerHTML = '<h3>Results:</h3>' +
                      '<h4>Image Analysis:</h4>' +
                      '<pre>' + JSON.stringify(data.imageAnalysis, null, 2) + '</pre>' +
                      '<h4>ORA Response:</h4>' +
                      '<p>' + data.oraResponse.completion + '</p>';
                  } else {
                    resultDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
                  }
                } catch (error) {
                  resultDiv.textContent = 'Error: ' + error.message;
                }
              }
            </script>
          </div>
        </body>
        </html>
      `);
      return;
    }
    
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start the server
const PORT = process.env.SERVER_PORT || 3000;
server.listen(PORT, () => {
  console.log(`ElizaOS Vision Agent server running at http://localhost:${PORT}`);
  console.log(`- API endpoints:`);
  console.log(`  - POST /api/analyze-image`);
  console.log(`  - POST /api/query-ora`);
  console.log(`  - POST /api/analyze-and-query`);
  console.log(`- Web interface: http://localhost:${PORT}`);
}); 