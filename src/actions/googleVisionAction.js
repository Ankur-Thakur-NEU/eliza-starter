/**
 * Action handler for Google Vision AI
 */

import { GoogleVisionClient } from '../services/googleVisionService.js';

export default class GoogleVisionAction {
  static actionName = 'analyze_image';
  static description = 'Analyzes an image using Google Vision AI';
  static parameters = [
    {
      name: 'imageUrl',
      type: 'string',
      description: 'URL of the image to analyze',
      required: true
    },
    {
      name: 'features',
      type: 'array',
      description: 'Features to detect (LABEL_DETECTION, TEXT_DETECTION, etc.)',
      required: false,
      default: ['LABEL_DETECTION', 'TEXT_DETECTION', 'OBJECT_LOCALIZATION']
    }
  ];

  constructor(agent) {
    this.agent = agent;
    this.visionClient = new GoogleVisionClient();
  }

  /**
   * Executes the Google Vision action with the provided parameters
   * @param {Object} params - Parameters for the action
   * @returns {Promise<Object>} - Analysis results from Google Vision AI
   */
  async execute(params) {
    try {
      const { imageUrl, features } = params;
      
      console.log(`Executing Google Vision action for image: ${imageUrl.substring(0, 50)}...`);
      
      const analysisResult = await this.visionClient.analyzeImage(imageUrl, features);
      
      return {
        success: true,
        data: analysisResult
      };
    } catch (error) {
      console.error('Error executing Google Vision action:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 