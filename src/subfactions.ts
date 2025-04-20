interface Subfaction {
  name: string;
  faction: {
    name: string;
  };
}

async function fetchSubfactions(): Promise<Subfaction[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/subfactions');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch subfactions: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderSubfactions() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const subfactions = await fetchSubfactions();
    if (subfactions.length === 0) {
      contentDiv.textContent = 'No subfactions found.';
      return;
    }

    subfactions.forEach((subfaction) => {
      const subfactionDiv = document.createElement('div');
      subfactionDiv.className = 'p-4 border rounded mb-2';
      subfactionDiv.innerHTML = `
        <h2>${subfaction.name}</h2>
        <p>Faction: ${subfaction.faction.name}</p>
      `;
      contentDiv.appendChild(subfactionDiv);
    });
  } catch (error) {
    console.error('Error rendering subfactions:', error);
    contentDiv.textContent = `Failed to load subfactions. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderSubfactions);