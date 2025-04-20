interface Keyword {
  name: string;
}

async function fetchKeywords(): Promise<Keyword[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch keywords: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderKeywords() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const keywords = await fetchKeywords();
    if (keywords.length === 0) {
      contentDiv.textContent = 'No keywords found.';
      return;
    }

    keywords.forEach((keyword) => {
      const keywordDiv = document.createElement('div');
      keywordDiv.className = 'p-4 border rounded mb-2';
      keywordDiv.innerHTML = `
        <h2>${keyword.name}</h2>
      `;
      contentDiv.appendChild(keywordDiv);
    });
  } catch (error) {
    console.error('Error rendering keywords:', error);
    contentDiv.textContent = `Failed to load keywords. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderKeywords);