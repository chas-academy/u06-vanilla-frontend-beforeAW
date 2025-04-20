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

async function populateWeaponsDropdown() {
  const dropdown = document.getElementById('figure-weapon-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Weapon profile dropdown not found');
    return;
  }

  try {
    const { fetchWeapons } = await import('./weapons.js'); // Dynamically import fetchWeapons
    const weapons = await fetchWeapons(); // Fetch weapons using the imported function
    console.log('Fetched weapons:', weapons); // Debugging log

    weapons.forEach((weapon) => {
      const option = document.createElement('option');
      option.value = weapon.name;
      option.textContent = weapon.name;
      dropdown.appendChild(option);
    });

    console.log('Dropdown populated successfully.');
  } catch (error) {
    console.error('Error populating weapon profiles dropdown:', error);
  }
}

const figureForm = document.getElementById('add-figure-form') as HTMLFormElement;
figureForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const figureName = (document.getElementById('figure-name') as HTMLInputElement).value;
  const figureMovement = parseInt((document.getElementById('figure-movement') as HTMLInputElement).value, 10);
  const figureToughness = parseInt((document.getElementById('figure-toughness') as HTMLInputElement).value, 10);
  const figureSaves = parseInt((document.getElementById('figure-saves') as HTMLInputElement).value, 10);
  const figureWounds = parseInt((document.getElementById('figure-wounds') as HTMLInputElement).value, 10);
  const figureLeadership = parseInt((document.getElementById('figure-leadership') as HTMLInputElement).value, 10);
  const figureOC = parseInt((document.getElementById('figure-oc') as HTMLInputElement).value, 10);
  const figureInvulnerableSave = parseInt((document.getElementById('figure-invulnerable-save') as HTMLInputElement).value, 10);

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/figures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: figureName,
        movement: figureMovement,
        toughness: figureToughness,
        saves: figureSaves,
        wounds: figureWounds,
        leadership: figureLeadership,
        oc: figureOC,
        invurnerableSave: figureInvulnerableSave
      }),
    });

    if (response.ok) {
      figureForm.reset();
      alert('Figure added successfully!');
    } else {
      alert('Failed to add figure. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderFigures(); // Render existing figures
});