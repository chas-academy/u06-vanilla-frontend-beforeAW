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

document.addEventListener('DOMContentLoaded', () => {
  const keywordForm = document.getElementById('add-keyword-form');

  if (keywordForm) {
    keywordForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const keywordInput = document.getElementById('keyword-name') as HTMLInputElement;
      const keywordName = keywordInput?.value ?? '';

      try {
        const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: keywordName }),
        });

        if (response.ok) {
          (keywordForm as HTMLFormElement).reset();

          const modal = document.getElementById('modal');
          if (modal) {
            modal.classList.add('hidden');
          }

          alert('Keyword added successfully!');
        } else {
          alert('Failed to add keyword. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[keywords.js] add-keyword-form not found on this page – skipping.');
  }
});