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

async function populateFactionDropdown() {
  const dropdown = document.getElementById('faction-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Faction dropdown not found');
    return;
  }

  try {
    const { fetchFactions } = await import('./factions.js'); // Dynamically import fetchFactions
    const factions = await fetchFactions();
    factions.forEach((faction) => {
      const option = document.createElement('option');
      option.value = faction.name;
      option.textContent = faction.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating faction dropdown:', error);
  }
}

const subFactionForm = document.getElementById('add-subfaction-form') as HTMLFormElement;
subFactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const subFactionName = (document.getElementById('subfaction-name') as HTMLInputElement).value;
  const selectedFaction = (document.getElementById('faction-dropdown') as HTMLSelectElement).value;

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/subfactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: subFactionName, faction: selectedFaction }),
    });

    if (response.ok) {
      subFactionForm.reset();
      alert('Subfaction added successfully!');
    } else {
      alert('Failed to add subfaction. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});


document.addEventListener('DOMContentLoaded', () => {
  populateFactionDropdown();
  renderSubfactions();
});