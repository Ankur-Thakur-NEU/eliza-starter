/**
 * Demo script for ElizaOS Vision Agent
 * This script demonstrates how to use the Google Vision AI and ORA integration
 */

// Import action handlers
import GoogleVisionAction from './actions/googleVisionAction.js';
import OraAction from './actions/oraAction.js';

// Set environment variables manually if dotenv fails
try {
  // Try to load environment variables from .env file
  import('dotenv/config').catch(err => {
    console.warn('Warning: dotenv package not available, using default environment variables');
  });
} catch (error) {
  console.warn('Warning: dotenv package not available, using default environment variables');
}

// Mock agent for demonstration purposes
const mockAgent = {
  name: 'ElizaOS Vision Agent',
  executeAction: async (actionName, params) => {
    console.log(`\n=== Executing action: ${actionName} ===\n`);
    
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

// Demo function
async function runDemo() {
  try {
    console.log('=== ElizaOS Vision Agent Demo ===\n');
    
    // Sample image URL (replace with a real image URL in production)
    const imageUrl = 'https://example.com/sample-image.jpg';
    
    // Step 1: Analyze the image with Google Vision AI
    console.log('Step 1: Analyzing image with Google Vision AI...');
    const imageAnalysis = await mockAgent.executeAction('analyze_image', {
      imageUrl: imageUrl
    });
    
    if (!imageAnalysis.success) {
      throw new Error(`Failed to analyze image: ${imageAnalysis.error}`);
    }
    
    console.log('Image analysis complete!');
    
    // Step 2: Query ORA with the analysis results
    console.log('\nStep 2: Querying ORA with the analysis results...');
    const userQuery = 'What can you tell me about this image?';
    
    const oraResponse = await mockAgent.executeAction('query_ora', {
      imageAnalysis: imageAnalysis.data,
      query: userQuery
    });
    
    if (!oraResponse.success) {
      throw new Error(`Failed to query ORA: ${oraResponse.error}`);
    }
    
    // Step 3: Display the results
    console.log('\n=== Results ===\n');
    console.log('User Query:', userQuery);
    console.log('\nORA Response:');
    console.log(oraResponse.data.completion);
    
    console.log('\n=== Demo Complete ===');
  } catch (error) {
    console.error('Error running demo:', error);
  }
}

// Run the demo
runDemo(); 