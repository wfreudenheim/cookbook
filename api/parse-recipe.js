const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipeText } = req.body;
    
    if (!recipeText) {
      return res.status(400).json({ error: 'Recipe text is required' });
    }

    // Check if this is a grocery list organization request
    if (recipeText.includes('Please organize this grocery list')) {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `You are organizing a grocery list. The list is already grouped into sections like "Produce", "Dairy & Eggs", etc.

Rules:
1. Keep all existing sections exactly as they are
2. Keep ingredients in their current sections
3. Only combine identical ingredients
4. Remove ingredients like "water for boiling"
5. For spices, remove amounts but keep the item
6. Keep all preparation notes (e.g., "for garnish")

Here's the list:
${recipeText}

Return a JSON object with this structure:
{
  "Produce": [
    { "name": "carrots", "amount": "3", "unit": "", "notes": "for garnish" }
  ],
  "Dairy & Eggs": [
    { "name": "milk", "amount": "2", "unit": "cups", "notes": "" }
  ]
}`
          }
        ]
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      const match = responseText.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('Failed to extract JSON from Claude response');
      }

      const cleanedList = JSON.parse(match[0]);
      return res.json(cleanedList);
    }

    // Regular recipe parsing
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a recipe parsing assistant. Extract structured recipe information from the provided text.
Return ONLY a JSON object with the following structure:
{
  "title": "Recipe title",
  "ingredients": [
    {
      "amount": "numeric amount",
      "unit": "measurement unit",
      "name": "ingredient name",
      "notes": "optional preparation notes"
    }
  ],
  "instructions": ["Step 1", "Step 2", ...],
  "servings": number (optional),
  "suggestedTags": ["tag1", "tag2", ...]
}

For suggestedTags, only use tags from these categories:
- Meal Type: breakfast, lunch, dinner, dessert, snack
- Cuisine: asian, italian, mexican, american, other
- Protein: chicken, beef, pork, fish, vegetarian

Clean up the ingredients to be consistent and clear. Combine similar ingredients if possible.

Here's the recipe to parse:
${recipeText}`
        }
      ]
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const parsedContent = JSON.parse(match[0]);
    return res.json(parsedContent);
  } catch (error) {
    console.error('Error parsing recipe:', error);
    return res.status(500).json({ error: 'Failed to parse recipe' });
  }
};
