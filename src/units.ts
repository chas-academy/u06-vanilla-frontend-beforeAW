interface Figure {
  name: string;
}

interface Ability {
  name: string;
}

interface Keyword {
  name: string;
}

interface Faction {
  name: string;
}

interface Subfaction {
  name: string;
}

interface Unit {
  name: string;
  figure: Figure[];
  faction: Faction;
  subfaction: Subfaction;
  abilities: Ability[];
  keywords: Keyword[];
}

async function fetchUnits(): Promise<Unit[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/units');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch units: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderUnits() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const units = await fetchUnits();
    if (units.length === 0) {
      contentDiv.textContent = 'No units found.';
      return;
    }

    units.forEach((unit) => {
      const unitDiv = document.createElement('div');
      unitDiv.className = 'p-4 border rounded mb-2';
      unitDiv.innerHTML = `
        <h2>${unit.name}</h2>
        <p>Faction: ${unit.faction.name}</p>
        <p>Subfaction: ${unit.subfaction.name}</p>
        <p>Figures:</p>
        <ul>
          ${
            unit.figure.length > 0
              ? unit.figure.map((f) => `<li>${f.name}</li>`).join('')
              : '<li>No figures</li>'
          }
        </ul>
        <p>Abilities:</p>
        <ul>
          ${
            unit.abilities.length > 0
              ? unit.abilities.map((a) => `<li>${a.name}</li>`).join('')
              : '<li>No abilities</li>'
          }
        </ul>
        <p>Keywords:</p>
        <ul>
          ${
            unit.keywords.length > 0
              ? unit.keywords.map((k) => `<li>${k.name}</li>`).join('')
              : '<li>No keywords</li>'
          }
        </ul>
      `;
      contentDiv.appendChild(unitDiv);
    });
  } catch (error) {
    console.error('Error rendering units:', error);
    contentDiv.textContent = `Failed to load units. Error: ${error}`;
  }
}

async function populateFactionForFigureDropdown() {
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

async function populateSubfactionDropdown() {
  const dropdown = document.getElementById('subfaction-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Subfaction dropdown not found');
    return;
  }

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/subfactions');
    if (!response.ok) {
      throw new Error('Failed to fetch subfactions');
    }
    const subfactions = await response.json();
    subfactions.forEach((subfaction: { name: string }) => {
      const option = document.createElement('option');
      option.value = subfaction.name;
      option.textContent = subfaction.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating subfaction dropdown:', error);
  }
}

async function populateFigureDropdown() {
  const dropdown = document.getElementById('figure-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Figure dropdown not found');
    return;
  }

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/figures');
    if (!response.ok) {
      throw new Error('Failed to fetch figures');
    }
    const figures = await response.json();
    figures.forEach((figure: { name: string }) => {
      const option = document.createElement('option');
      option.value = figure.name;
      option.textContent = figure.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating figure dropdown:', error);
  }
}

async function populateAbilityDropdown() {
  const dropdown = document.getElementById('ability-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Ability dropdown not found');
    return;
  }

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities');
    if (!response.ok) {
      throw new Error('Failed to fetch abilities');
    }
    const abilities = await response.json();
    abilities.forEach((ability: { name: string }) => {
      const option = document.createElement('option');
      option.value = ability.name;
      option.textContent = ability.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating ability dropdown:', error);
  }
}

async function populateKeywordDropdown() {
  const dropdown = document.getElementById('keyword-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Keyword dropdown not found');
    return;
  }

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords');
    if (!response.ok) {
      throw new Error('Failed to fetch keywords');
    }
    const keywords = await response.json();
    keywords.forEach((keyword: { name: string }) => {
      const option = document.createElement('option');
      option.value = keyword.name;
      option.textContent = keyword.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating keyword dropdown:', error);
  }
}

const unitForm = document.getElementById('add-units-form') as HTMLFormElement;
unitForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const unitName = (document.getElementById('unit-name') as HTMLInputElement).value;
  const selectedFaction = (document.getElementById('faction-dropdown') as HTMLSelectElement).value;
  const selectedSubfaction = (document.getElementById('subfaction-dropdown') as HTMLSelectElement).value;
  const selectedFigure = (document.getElementById('figure-dropdown') as HTMLSelectElement).value;
  const selectedAbility = (document.getElementById('ability-dropdown') as HTMLSelectElement).value;
  const selectedKeyword = (document.getElementById('keyword-dropdown') as HTMLSelectElement).value;

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/units', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: unitName,
        faction: selectedFaction,
        subfaction: selectedSubfaction,
        figure: selectedFigure,
        ability: selectedAbility,
        keyword: selectedKeyword,
      }),
    });

    if (response.ok) {
      unitForm.reset();
      alert('Unit added successfully!');
    } else {
      alert('Failed to add unit. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  populateFactionForFigureDropdown();
  populateSubfactionDropdown();
  populateFigureDropdown();
  populateAbilityDropdown();
  populateKeywordDropdown();
  renderUnits();
});