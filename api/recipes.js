module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Passphrase');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Passphrase check
  const passphrase = req.headers['x-passphrase'];
  if (!passphrase || passphrase !== process.env.EDIT_PASSPHRASE) {
    return res.status(401).json({ error: 'Invalid passphrase' });
  }

  const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const FILE_PATH = 'public/recipes.json';
  const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    // Fetch current file from GitHub
    const fileResponse = await fetch(API_BASE, { headers });

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch recipes file: ${fileResponse.status}`);
    }

    const fileData = await fileResponse.json();
    const currentSha = fileData.sha;
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    let recipes = JSON.parse(currentContent);

    let commitMessage;

    if (req.method === 'POST') {
      const newRecipe = req.body;
      recipes.unshift(newRecipe);
      commitMessage = `Add recipe: ${newRecipe.title}`;

    } else if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const index = recipes.findIndex(r => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      recipes[index] = { ...recipes[index], ...updates, updatedAt: new Date().toISOString() };
      commitMessage = `Update recipe: ${recipes[index].title}`;

    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      const index = recipes.findIndex(r => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      commitMessage = `Delete recipe: ${recipes[index].title}`;
      recipes.splice(index, 1);

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Commit updated file back to GitHub
    const updatedContent = Buffer.from(
      JSON.stringify(recipes, null, 2)
    ).toString('base64');

    const commitResponse = await fetch(API_BASE, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: updatedContent,
        sha: currentSha,
      }),
    });

    if (!commitResponse.ok) {
      if (commitResponse.status === 409) {
        return res.status(409).json({ error: 'Conflict - another edit was in progress. Please try again.' });
      }
      const errorData = await commitResponse.json();
      throw new Error(`Failed to commit: ${JSON.stringify(errorData)}`);
    }

    return res.status(200).json({ success: true, recipes });
  } catch (error) {
    console.error('Error in recipes API:', error);
    return res.status(500).json({ error: error.message });
  }
};
