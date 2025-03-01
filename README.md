# ElizaOS Vision Agent

This project integrates Google Vision AI and ORA into the ElizaOS framework to create a powerful image analysis agent.

## Features

- Pre-processes images using Google Vision AI before sending to ORA
- Provides structured data about image content (labels, text, objects)
- Creates a robust system that can handle various image formats and content
- Leverages the ElizaOS framework's action system for clean integration

## Setup Instructions

### 1. Prerequisites

- Node.js 14 or higher
- npm or yarn
- Google Cloud Platform account
- ORA API access

### 2. Installation

```bash
# Clone the ElizaOS repository (if not already done)
git clone https://github.com/ElizaOS/ElizaOS.git
cd ElizaOS

# Install dependencies
npm install
```

### 3. Google Cloud Setup

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and description
   - Grant the "Cloud Vision API User" role
   - Click "Done"
4. Create a key for the service account:
   - Find your service account in the list
   - Click on the three dots menu > "Manage keys"
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - The key file will be downloaded to your computer
5. Place the downloaded JSON key file in your project directory as `ethdenver-452221-b65f6c14e20f.json`

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```
# Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS=./ethdenver-452221-b65f6c14e20f.json

# ORA API credentials
ORA_API_KEY=your_ora_api_key
ORA_API_URL=https://api.ora.ai/api/v1
```

### 5. Build and Run

```bash
# Build the project
npm run build

# Start the agent
npm start
```

### 6. Run the Demo

```bash
# Run the demo script
node src/demo.js
```

## Usage

Once your agent is running, you can use it to analyze images and get responses from ORA with the enhanced context:

```javascript
// Example: Analyze an image
const imageAnalysis = await agent.executeAction('analyze_image', {
  imageUrl: 'https://example.com/image.jpg'
});

// Example: Query ORA with the analysis results
const oraResponse = await agent.executeAction('query_ora', {
  imageAnalysis: imageAnalysis.data,
  query: "What can you tell me about this image?"
});
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Make sure your service account key file is correctly placed and has the right format
2. Check that you've enabled the Vision API in your Google Cloud project
3. Verify that the service account has the necessary permissions
4. Verify that billing is enabled for your Google Cloud project

### API Limits

Be aware of Google Vision API usage limits. Check your Google Cloud Console for quota information.

## License

MIT