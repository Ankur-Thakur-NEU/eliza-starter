// Set the SERVER_PORT environment variable
process.env.SERVER_PORT = 3000;

// Import and run the server
import('./src/server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

console.log('Starting ElizaOS Vision Agent server on port 3000...'); 