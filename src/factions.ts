interface Faction {
  _id: string;
  name: string;
}

let isEditMode = false;
let currentFactionId: string | null = null;

export async function fetchFactions(): Promise<Faction[]> {
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

    contentDiv.innerHTML = '';

    factions.forEach((faction) => {
      const factionDiv = document.createElement('div');
      factionDiv.className = 'p-4 border rounded mb-2';
      factionDiv.innerHTML = `
        <h2>${faction.name}</h2>
        <br>
        <button class="edit-faction-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-faction-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = factionDiv.querySelector('.edit-faction-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current faction's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const factionNameInput = document.getElementById('faction-name') as HTMLInputElement;

        modal.classList.remove('hidden'); // Show the modal
        factionNameInput.value = faction.name; // Populate the name

        isEditMode = true; // Set edit mode to true
        currentFactionId = faction._id; // Store the ID of the faction being edited
      });

      // Add Delete functionality
      const deleteButton = factionDiv.querySelector('.delete-faction-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the faction "${faction.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/factions/${faction._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            factionDiv.remove(); // Remove the faction from the DOM
            alert(`Faction "${faction.name}" deleted successfully!`);
          } else {
            alert('Failed to delete faction. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting faction:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(factionDiv);
    });
  } catch (error) {
    console.error('Error rendering factions:', error);
    contentDiv.textContent = `Failed to load factions. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFactions();

  const factionForm = document.getElementById('add-faction-form') as HTMLFormElement;
  if (factionForm) {
    factionForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const factionNameInput = document.getElementById('faction-name') as HTMLInputElement;
      const factionName = factionNameInput?.value ?? '';

      try {
        if (isEditMode && currentFactionId) {
          // Handle update (PUT request)
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/factions/${currentFactionId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: factionName }),
          });

          if (response.ok) {
            alert(`Faction updated successfully!`);
            isEditMode = false; // Reset edit mode
            currentFactionId = null; // Clear the current ID
            factionForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderFactions(); // Re-render the factions
          } else {
            alert('Failed to update faction. Please try again.');
          }
        } else {
          // Handle add (POST request)
          const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/factions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: factionName }),
          });

          if (response.ok) {
            alert('Faction added successfully!');
            factionForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderFactions(); // Re-render the factions
          } else {
            alert('Failed to add faction. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[factions.ts] add-faction-form not found on this page – skipping.');
  }
});