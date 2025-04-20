interface Weapon {
  _id: string;
  name: string;
}

interface Figure {
  _id: string;
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

    contentDiv.innerHTML = '';

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
        <br>
        <button class="edit-figure-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-figure-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = figureDiv.querySelector('.edit-figure-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current figure's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const figureNameInput = document.getElementById('figure-name') as HTMLInputElement;
        const figureMovementInput = document.getElementById('figure-movement') as HTMLInputElement;
        const figureToughnessInput = document.getElementById('figure-toughness') as HTMLInputElement;
        const figureSavesInput = document.getElementById('figure-saves') as HTMLInputElement;
        const figureWoundsInput = document.getElementById('figure-wounds') as HTMLInputElement;
        const figureLeadershipInput = document.getElementById('figure-leadership') as HTMLInputElement;
        const figureOCInput = document.getElementById('figure-oc') as HTMLInputElement;
        const figureInvulnerableSaveInput = document.getElementById('figure-invulnerable-save') as HTMLInputElement;
        const figureWeaponDropdown = document.getElementById('figure-weapon-dropdown') as HTMLSelectElement;

        modal.classList.remove('hidden'); // Show the modal
        figureNameInput.value = figure.name;
        figureMovementInput.value = figure.movement.toString();
        figureToughnessInput.value = figure.toughness.toString();
        figureSavesInput.value = figure.saves.toString();
        figureWoundsInput.value = figure.wounds.toString();
        figureLeadershipInput.value = figure.leadership.toString();
        figureOCInput.value = figure.oc.toString();
        figureInvulnerableSaveInput.value = figure.invurnerableSave.toString();

        // Populate weapons dropdown with selected weapons
        if (figure.weapon.length > 0) {
          figureWeaponDropdown.value = figure.weapon[0]._id; // Select the first weapon ID
        } else {
          figureWeaponDropdown.value = ''; // Default to empty
        }

        // Update the form submission to handle PUT
        const form = document.getElementById('add-figure-form') as HTMLFormElement;
        form.onsubmit = async (event) => {
          event.preventDefault();

          try {
            const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/figures/${figure._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: figureNameInput.value,
                movement: parseInt(figureMovementInput.value, 10),
                toughness: parseInt(figureToughnessInput.value, 10),
                saves: parseInt(figureSavesInput.value, 10),
                wounds: parseInt(figureWoundsInput.value, 10),
                leadership: parseInt(figureLeadershipInput.value, 10),
                oc: parseInt(figureOCInput.value, 10),
                invurnerableSave: parseInt(figureInvulnerableSaveInput.value, 10),
                weapon: [figureWeaponDropdown.value], // Send weapon IDs as an array
              }),
            });

            if (response.ok) {
              alert(`Figure "${figure.name}" updated successfully!`);
              modal.classList.add('hidden'); // Hide the modal
              renderFigures(); // Re-render the figures
            } else {
              alert('Failed to update figure. Please try again.');
            }
          } catch (error) {
            console.error('Error updating figure:', error);
            alert('An error occurred. Please try again.');
          }
        };
      });

      // Add Delete functionality
      const deleteButton = figureDiv.querySelector('.delete-figure-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the figure "${figure.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/figures/${figure._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            figureDiv.remove(); // Remove the figure from the DOM
            alert(`Figure "${figure.name}" deleted successfully!`);
          } else {
            alert('Failed to delete figure. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting figure:', error);
          alert('An error occurred. Please try again.');
        }
      });

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
    console.error('Weapon dropdown not found');
    return;
  }

  try {
    const { fetchWeapons } = await import('./weapons.js'); // Dynamically import fetchWeapons
    const weapons = await fetchWeapons();

    weapons.forEach((weapon) => {
      const option = document.createElement('option');
      option.value = weapon._id;
      option.textContent = weapon.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating weapon dropdown:', error);
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
  const figureWeaponDropdown = document.getElementById('figure-weapon-dropdown') as HTMLSelectElement;

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
        invurnerableSave: figureInvulnerableSave,
        weapon: [figureWeaponDropdown.value], // Send weapon IDs as an array
      }),
    });

    if (response.ok) {
      figureForm.reset();
      alert('Figure added successfully!');

      const modal = document.getElementById('modal') as HTMLDivElement;
      if (modal) {
        modal.classList.add('hidden');
      }
    
      renderFigures(); // Re-render the figures
    } else {
      alert('Failed to add figure. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  populateWeaponsDropdown();
  renderFigures(); // Render existing figures
});