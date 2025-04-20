interface Figure {
  _id: string;
  name: string;
}

interface Ability {
  _id: string;
  name: string;
}

interface Keyword {
  _id: string;
  name: string;
}

interface Faction {
  _id: string;
  name: string;
}

interface Subfaction {
  _id: string;
  name: string;
}

interface Unit {
  _id: string;
  name: string;
  figure: Figure[];
  faction: Faction;
  subfaction: Subfaction;
  abilities: Ability[];
  keywords: Keyword[];
}

let isEditModeUnits = false;
let currentUnitId: string | null = null;

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

    contentDiv.innerHTML = '';

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
        <br>
        <button class="edit-unit-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-unit-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = unitDiv.querySelector('.edit-unit-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        const modal = document.getElementById('modal') as HTMLDivElement;
        const unitNameInput = document.getElementById('unit-name') as HTMLInputElement;
        const factionDropdown = document.getElementById('faction-dropdown') as HTMLSelectElement;
        const subfactionDropdown = document.getElementById('subfaction-dropdown') as HTMLSelectElement;
        const figureDropdown = document.getElementById('figure-dropdown') as HTMLSelectElement;
        const abilityDropdown = document.getElementById('ability-dropdown') as HTMLSelectElement;
        const keywordDropdown = document.getElementById('keyword-dropdown') as HTMLSelectElement;

        modal.classList.remove('hidden'); // Show the modal
        unitNameInput.value = unit.name;
        factionDropdown.value = unit.faction._id;
        subfactionDropdown.value = unit.subfaction._id;
        figureDropdown.value = unit.figure[0]?._id || ''; // Assuming one figure
        abilityDropdown.value = unit.abilities[0]?._id || ''; // Assuming one ability
        keywordDropdown.value = unit.keywords[0]?._id || ''; // Assuming one keyword

        isEditModeUnits = true;
        currentUnitId = unit._id;

        const form = document.getElementById('add-units-form') as HTMLFormElement;
        form.onsubmit = async (event) => {
          event.preventDefault();

          try {
            const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/units/${unit._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: unitNameInput.value,
                faction: factionDropdown.value,
                subfaction: subfactionDropdown.value,
                figure: [figureDropdown.value],
                abilities: [abilityDropdown.value],
                keywords: [keywordDropdown.value],
              }),
            });

            if (response.ok) {
              alert(`Unit "${unit.name}" updated successfully!`);
              modal.classList.add('hidden');
              renderUnits();
            } else {
              alert('Failed to update unit. Please try again.');
            }
          } catch (error) {
            console.error('Error updating unit:', error);
            alert('An error occurred. Please try again.');
          }
        };
      });

      // Add Delete functionality
      const deleteButton = unitDiv.querySelector('.delete-unit-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the unit "${unit.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/units/${unit._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            unitDiv.remove();
            alert(`Unit "${unit.name}" deleted successfully!`);
          } else {
            alert('Failed to delete unit. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting unit:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(unitDiv);
    });
  } catch (error) {
    console.error('Error rendering units:', error);
    contentDiv.textContent = `Failed to load units. Error: ${error}`;
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
    subfactions.forEach((subfaction: Subfaction) => {
      const option = document.createElement('option');
      option.value = subfaction._id;
      option.textContent = subfaction.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating subfaction dropdown:', error);
  }
}

async function populateFactionForFigureDropdown() {
  const dropdown = document.getElementById('faction-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Faction dropdown not found');
    return;
  }

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/factions');
    if (!response.ok) {
      throw new Error('Failed to fetch factions');
    }

    const factions = await response.json();
    factions.forEach((faction: Faction) => {
      const option = document.createElement('option');
      option.value = faction._id;
      option.textContent = faction.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating faction dropdown:', error);
  }
}
// Function to populate the Figure dropdown
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
    figures.forEach((figure: Figure) => {
      const option = document.createElement('option');
      option.value = figure._id;
      option.textContent = figure.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating figure dropdown:', error);
  }
}

// Function to populate the Ability dropdown
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
    abilities.forEach((ability: Ability) => {
      const option = document.createElement('option');
      option.value = ability._id;
      option.textContent = ability.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating ability dropdown:', error);
  }
}

// Function to populate the Keyword dropdown
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
    keywords.forEach((keyword: Keyword) => {
      const option = document.createElement('option');
      option.value = keyword._id;
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
        figure: [selectedFigure],
        abilities: [selectedAbility],
        keywords: [selectedKeyword],
      }),
    });

    if (response.ok) {
      unitForm.reset();
      alert('Unit added successfully!');
      const modal = document.getElementById('modal') as HTMLDivElement;
      if (modal) {
        modal.classList.add('hidden');
      }
      renderUnits();
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