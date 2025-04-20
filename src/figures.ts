interface Weapon {
  name: string;
}

interface Figure {
  name: string;
  movement: number;
  toughness: number;
  saves: number;
  wounds: number;
  leadership: number;
  oc: number;
  invurnerableSave: number;
  weapon: Weapon[]; // Array of weapons
}

async function fetchFigures(): Promise<Figure[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/figures');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch figures: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderFigures() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const figures = await fetchFigures();
    if (figures.length === 0) {
      contentDiv.textContent = 'No figures found.';
      return;
    }

    figures.forEach((figure) => {
      const figureDiv = document.createElement('div');
      figureDiv.className = 'p-4 border rounded mb-2';
      figureDiv.innerHTML = `
        <h2>${figure.name}</h2>
        <p>Movement: ${figure.movement}"</p>
        <p>Toughness: ${figure.toughness}</p>
        <p>Saves: ${figure.saves}+</p>
        <p>Wounds: ${figure.wounds}</p>
        <p>Leadership: ${figure.leadership}</p>
        <p>OC: ${figure.oc}</p>
        <p>Invulnerable Save: ${figure.invurnerableSave > 0 ? figure.invurnerableSave + '+' : 'None'}</p>
        <p>Weapons:</p>
        <ul>
          ${
            figure.weapon.length > 0
              ? figure.weapon.map((w) => `<li>${w.name}</li>`).join('')
              : '<li>No weapons</li>'
          }
        </ul>
      `;
      contentDiv.appendChild(figureDiv);
    });
  } catch (error) {
    console.error('Error rendering figures:', error);
    contentDiv.textContent = `Failed to load figures. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderFigures);