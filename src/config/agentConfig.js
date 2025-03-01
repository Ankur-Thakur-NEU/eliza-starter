/**
 * Agent configuration file
 * This file registers all available actions for the ElizaOS agent
 */

import GoogleVisionAction from '../actions/googleVisionAction.js';
import OraAction from '../actions/oraAction.js';

// Export the action registry
export const actionRegistry = [
  // Add our vision and ORA actions
  GoogleVisionAction,
  OraAction,
  
  // Other actions would be registered here
]; 