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

document.addEventListener('DOMContentLoaded', renderUnits);