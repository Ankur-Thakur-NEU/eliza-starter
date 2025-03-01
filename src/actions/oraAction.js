/**
 * ORA API action implementation
 * This action queries the ORA API with image analysis data
 */

export class OraAction {
  static actionName = 'query_ora';
  static description = 'Queries the ORA API with image analysis data';
  static parameters = [
    {
      name: 'imageAnalysis',
      type: 'object',
      description: 'Analysis data from Google Vision AI',
      required: true
    },
    {
      name: 'query',
      type: 'string',
      description: 'User query about the image',
      required: true
    }
  ];

  constructor(agent) {
    this.agent = agent;
    this.apiKey = process.env.ORA_API_KEY || 'mock-api-key';
    this.apiUrl = process.env.ORA_API_URL || 'https://api.ora.ai/api/v1/query';
  }

  /**
   * Executes the ORA API action
   * @param {Object} parameters - Action parameters
   * @returns {Promise<Object>} - ORA API response
   */
  async execute(parameters) {
    const { imageAnalysis, query } = parameters;
    
    console.log(`ORA Action executing with query: "${query}"`);
    console.log('Image analysis data:', JSON.stringify(imageAnalysis, null, 2));
    
    try {
      // Prepare context string with image analysis results
      const contextString = this.prepareContextString(imageAnalysis);
      
      // In a real implementation, this would make an API call to ORA
      // For example:
      // const response = await fetch(this.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   body: JSON.stringify({
      //     context: contextString,
      //     query: query
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a response based on the image analysis and query
      return this.generateResponse(imageAnalysis, query, contextString);
      
    } catch (error) {
      console.error('Error querying ORA API:', error.message);
      return {
        error: true,
        message: `Failed to query ORA API: ${error.message}`
      };
    }
  }

  /**
   * Prepares a context string from image analysis data
   * @param {Object} imageAnalysis - Image analysis data
   * @returns {string} - Context string for ORA API
   */
  prepareContextString(imageAnalysis) {
    const { labels, objects, text } = imageAnalysis;
    
    let context = 'Image Analysis Results:\n';
    
    // Add labels
    if (labels && labels.length > 0) {
      context += 'Labels: ';
      context += labels.map(label => `${label.description} (confidence: ${label.score.toFixed(2)})`).join(', ');
      context += '\n';
    }
    
    // Add text
    if (text && text.length > 0) {
      context += `Text detected: ${text}\n`;
    } else {
      context += 'Text detected: None\n';
    }
    
    // Add objects
    if (objects && objects.length > 0) {
      context += 'Objects: ';
      context += objects.map(object => `${object.name} (confidence: ${object.score.toFixed(2)})`).join(', ');
      context += '\n';
    }
    
    console.log('Prepared context for ORA:\n', context);
    return context;
  }

  /**
   * Generates a response based on image analysis and query
   * @param {Object} imageAnalysis - Image analysis data
   * @param {string} query - User query
   * @param {string} contextString - Context string for ORA API
   * @returns {Object} - Generated response
   */
  generateResponse(imageAnalysis, query, contextString) {
    const { labels, objects, text } = imageAnalysis;
    
    // Extract the main subjects from the image
    const mainLabels = labels.slice(0, 5).map(l => l.description.toLowerCase());
    const mainObjects = objects.map(o => o.name.toLowerCase());
    const allEntities = [...mainLabels, ...mainObjects];
    
    // Check for specific query types
    const queryLower = query.toLowerCase();
    
    // Luxury item identification - NEW SECTION
    const luxuryItems = [
      'watch', 'analog watch', 'timepiece', 'wristwatch', 'chronograph', 'rolex', 'omega', 'patek philippe',
      'jewelry', 'ring', 'necklace', 'bracelet', 'diamond', 'gold', 'silver', 'platinum',
      'sneakers', 'shoes', 'nike', 'adidas', 'jordan', 'yeezy', 'designer', 'luxury', 'fashion',
      'handbag', 'purse', 'wallet', 'louis vuitton', 'gucci', 'prada', 'chanel', 'hermes'
    ];
    
    // Check if any luxury items are detected
    const detectedLuxuryItems = allEntities.filter(item => luxuryItems.includes(item));
    
    if (detectedLuxuryItems.length > 0 || 
        mainLabels.some(label => label.includes('watch') || label.includes('jewelry') || label.includes('fashion'))) {
      
      // Specific handling for watches
      if (mainLabels.includes('watch') || mainLabels.includes('analog watch') || 
          mainObjects.includes('watch') || mainObjects.includes('analog watch')) {
        
        // Get watch details from labels
        const watchDetails = labels
          .filter(l => !['watch', 'analog watch'].includes(l.description.toLowerCase()))
          .slice(0, 5)
          .map(l => l.description);
        
        return {
          completion: `This image shows a luxury timepiece. It appears to be an analog watch with the following characteristics: ${watchDetails.join(', ')}. Watches like this are precision instruments that combine craftsmanship with functionality, often serving as both a practical tool and a fashion statement or collectible item.`
        };
      }
      
      // Generic luxury item response
      return {
        completion: `This image shows a luxury collectible item: ${detectedLuxuryItems.join(', ')}. The item features ${mainLabels.slice(0, 3).join(', ')} design elements. Luxury items like this are often valued for their craftsmanship, brand prestige, and aesthetic appeal, making them desirable collectibles.`
      };
    }
    
    // Animal identification
    else if (queryLower.includes('animal') || queryLower.includes('pet')) {
      if (allEntities.includes('cat')) {
        return {
          completion: "The image shows a cat. Cats are domestic felines known for their independent nature and grooming habits. They are popular pets worldwide."
        };
      } else if (allEntities.includes('dog')) {
        return {
          completion: "The image shows a dog. Dogs are domesticated mammals known for their loyalty and companionship. They are one of the most popular pets globally."
        };
      } else if (mainLabels.some(label => ['animal', 'mammal', 'wildlife'].includes(label))) {
        const animalType = mainLabels.find(label => !['animal', 'mammal', 'wildlife'].includes(label));
        return {
          completion: `The image appears to show a ${animalType || 'wild animal'}. I can see characteristics typical of ${animalType || 'wildlife'} in the image.`
        };
      } else {
        return {
          completion: "I don't see any animals in this image. The image appears to show " + 
                     (mainLabels[0] ? `a ${mainLabels[0]}` : "a scene without animals") + "."
        };
      }
    }
    
    // Object identification
    else if (queryLower.includes('object') || queryLower.includes('thing') || 
             queryLower.includes('what is') || queryLower.includes("what's in") || 
             queryLower.includes('show me')) {
      
      if (objects.length > 0) {
        const objectsList = objects.map(o => o.name).join(', ');
        
        // Check for luxury items first
        if (detectedLuxuryItems.length > 0) {
          return {
            completion: `The main object in this image is a luxury item: ${objectsList}. It features ${mainLabels.slice(0, 3).join(', ')} design elements. This appears to be a high-quality collectible item.`
          };
        }
        
        return {
          completion: `The main objects in this image are: ${objectsList}. The image primarily shows ${mainLabels[0] || 'a scene'} with ${objects.length} identifiable objects.`
        };
      } else if (mainLabels.length > 0) {
        // If no objects but we have labels
        return {
          completion: `This image shows ${mainLabels[0]} with features including ${mainLabels.slice(1, 4).join(', ')}. ${
            text && text.length > 0 ? `There is also text visible: "${text}".` : ''
          }`
        };
      } else {
        return {
          completion: `The image doesn't contain clearly defined objects. It appears to be a scene.`
        };
      }
    }
    
    // Color queries
    else if (queryLower.includes('color') || queryLower.includes('colour')) {
      // Check if any color labels exist
      const colorLabels = mainLabels.filter(label => 
        ['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'orange', 'pink', 'brown', 'gray', 'grey', 'silver', 'gold'].includes(label)
      );
      
      if (colorLabels.length > 0) {
        return {
          completion: `The dominant colors in this image appear to be ${colorLabels.join(', ')}.`
        };
      } else if (mainLabels.includes('sky') || mainObjects.includes('sky')) {
        return {
          completion: "The image contains sky which appears blue, and likely has other natural colors typical of an outdoor scene."
        };
      } else if (mainLabels.includes('landscape') || mainLabels.includes('nature')) {
        return {
          completion: "The image shows a natural landscape with typical earth tones, greens from vegetation, and blues from the sky."
        };
      } else {
        return {
          completion: "I cannot specifically identify the colors in this image, but it appears to show " + 
                     (mainLabels[0] ? `a ${mainLabels[0]}` : "a scene") + " with its typical coloration."
        };
      }
    }
    
    // Text content - only prioritize if the query specifically asks about text
    else if (queryLower.includes('text') || queryLower.includes('say') || queryLower.includes('write') || 
             queryLower.includes('read')) {
      if (text && text.length > 0) {
        return {
          completion: `The text in the image reads: "${text}"`
        };
      } else {
        return {
          completion: "There is no visible text in this image."
        };
      }
    }
    
    // Location queries
    else if (queryLower.includes('where') || queryLower.includes('location')) {
      if (mainLabels.includes('landscape') || mainLabels.includes('nature') || mainLabels.includes('outdoor')) {
        return {
          completion: "This appears to be an outdoor natural setting. Based on the visible elements like " + 
                     (mainLabels.includes('tree') ? "trees" : "natural features") + 
                     ", it's likely a park, forest, or natural landscape area."
        };
      } else if (mainLabels.includes('indoor') || mainLabels.includes('room')) {
        return {
          completion: "This appears to be an indoor setting, possibly a " + 
                     (mainLabels.includes('kitchen') ? "kitchen" : 
                      mainLabels.includes('bedroom') ? "bedroom" : 
                      mainLabels.includes('office') ? "office" : "room or building interior") + "."
        };
      } else if (mainLabels.includes('urban') || mainLabels.includes('city')) {
        return {
          completion: "This appears to be an urban setting, possibly in a city or town environment."
        };
      } else {
        return {
          completion: "I cannot determine the specific location from this image. It appears to show " + 
                     (mainLabels[0] ? `a ${mainLabels[0]}` : "a scene") + "."
        };
      }
    }
    
    // Default response based on image content
    else {
      // Check for luxury items first
      if (detectedLuxuryItems.length > 0) {
        if (mainLabels.includes('watch') || mainLabels.includes('analog watch') || 
            mainObjects.includes('watch') || mainObjects.includes('analog watch')) {
          
          // Get watch details from labels
          const watchDetails = labels
            .filter(l => !['watch', 'analog watch'].includes(l.description.toLowerCase()))
            .slice(0, 5)
            .map(l => l.description);
          
          return {
            completion: `This image shows a luxury timepiece. It appears to be an analog watch with the following characteristics: ${watchDetails.join(', ')}. Watches like this are precision instruments that combine craftsmanship with functionality, often serving as both a practical tool and a fashion statement or collectible item.`
          };
        }
        
        return {
          completion: `This image shows a luxury collectible item: ${detectedLuxuryItems.join(', ')}. The item features ${mainLabels.slice(0, 3).join(', ')} design elements. Luxury items like this are often valued for their craftsmanship, brand prestige, and aesthetic appeal, making them desirable collectibles.`
        };
      }
      
      // Other specific categories
      if (mainLabels.includes('cat') || mainObjects.includes('cat')) {
        return {
          completion: "This image shows a cat. It appears to be a domestic feline, commonly kept as a pet. Cats are known for their independent nature, agility, and grooming habits."
        };
      } else if (mainLabels.includes('dog') || mainObjects.includes('dog')) {
        return {
          completion: "This image shows a dog. Dogs are domesticated mammals that have been bred for various tasks such as hunting, herding, protection, and companionship."
        };
      } else if (mainLabels.includes('person') || mainObjects.includes('person')) {
        return {
          completion: "This image shows a person. I can see a human figure in the frame, though I cannot identify specific individuals."
        };
      } else if (mainLabels.includes('food') || mainObjects.includes('food')) {
        return {
          completion: "This image shows food. It appears to be a prepared dish or meal, though I cannot identify the specific cuisine or ingredients in detail."
        };
      } else if (mainLabels.includes('car') || mainObjects.includes('car')) {
        return {
          completion: "This image shows a car. It's a motor vehicle designed for transportation on roads, typically with four wheels."
        };
      } else if (text && text.length > 0 && text.length > 10) {
        // Only prioritize text if it's substantial and no other significant objects are detected
        return {
          completion: `This image contains text that reads: "${text}". It appears to be a document or text-containing image.`
        };
      } else if (mainLabels.includes('landscape') || mainLabels.includes('nature')) {
        return {
          completion: "This image depicts a landscape photo featuring trees and sky with clouds. It's a natural outdoor scene showing elements of nature."
        };
      } else {
        // Enhanced generic response based on top labels and objects
        const topLabels = mainLabels.slice(0, 5).filter(l => l.length > 0);
        
        if (objects.length > 0) {
          return {
            completion: `This image shows ${objects.map(o => o.name).join(', ')}. The key features include ${topLabels.join(', ')}. ${
              text && text.length > 0 ? `There is also some text visible: "${text}".` : ''
            }`
          };
        } else if (topLabels.length > 0) {
          return {
            completion: `This image shows ${topLabels[0]} with features including ${topLabels.slice(1).join(', ')}. ${
              text && text.length > 0 ? `There is also some text visible: "${text}".` : ''
            }`
          };
        } else {
          return {
            completion: "This image doesn't contain clearly identifiable objects or features that I can describe with confidence."
          };
        }
      }
    }
  }
} 