interface Faction {
  name: string;
}

async function fetchFactions(): Promise<Faction[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/factions');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch factions: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderFactions() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const factions = await fetchFactions();
    if (factions.length === 0) {
      contentDiv.textContent = 'No factions found.';
      return;
    }

    factions.forEach((faction) => {
      const factionDiv = document.createElement('div');
      factionDiv.className = 'p-4 border rounded mb-2';
      factionDiv.innerHTML = `
        <h2>${faction.name}</h2>
      `;
      contentDiv.appendChild(factionDiv);
    });
  } catch (error) {
    console.error('Error rendering factions:', error);
    contentDiv.textContent = `Failed to load factions. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderFactions);

const Factionform = document.getElementById('add-faction-form') as HTMLFormElement;
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const factionName = (document.getElementById('ability-name') as HTMLInputElement).value;


  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/factions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: factionName}),
    });

    if (response.ok) {
      form.reset();
      modal.classList.add('hidden');
    } else {
      alert('Failed to add ability. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});