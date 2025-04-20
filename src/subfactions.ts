interface Subfaction {
  _id: string;
  faction: {
    _id: string;
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

    contentDiv.innerHTML = '';

    subfactions.forEach((subfaction) => {
      const subfactionDiv = document.createElement('div');
      subfactionDiv.className = 'p-4 border rounded mb-2';
      subfactionDiv.innerHTML = `
        <h2>${subfaction.name}</h2>
        <p>Faction: ${subfaction.faction.name}</p>
        <br>
        <button class="edit-subfaction-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-subfaction-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = subfactionDiv.querySelector('.edit-subfaction-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current subfaction's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const subfactionNameInput = document.getElementById('subfaction-name') as HTMLInputElement;
        const factionDropdown = document.getElementById('faction-dropdown') as HTMLSelectElement;

        modal.classList.remove('hidden'); // Show the modal
        subfactionNameInput.value = subfaction.name; // Populate the name
        factionDropdown.value = subfaction.faction._id; // Populate the faction ID

        // Update the form submission to handle PUT
        const form = document.getElementById('add-subfaction-form') as HTMLFormElement;
        form.onsubmit = async (event) => {
          event.preventDefault();

          try {
            const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/subfactions/${subfaction._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: subfactionNameInput.value,
                faction: factionDropdown.value, // Send the faction ID
              }),
            });

            if (response.ok) {
              alert(`Subfaction "${subfaction.name}" updated successfully!`);
              modal.classList.add('hidden'); // Hide the modal
              renderSubfactions(); // Re-render the subfactions
            } else {
              const errorText = await response.text();
              console.error('Failed to update subfaction:', errorText);
              alert(`Failed to update subfaction. Server responded with: ${errorText}`);
            }
          } catch (error) {
            console.error('Error updating subfaction:', error);
            alert('An error occurred. Please try again.');
          }
        };
      });

      // Add Delete functionality
      const deleteButton = subfactionDiv.querySelector('.delete-subfaction-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the subfaction "${subfaction.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/subfactions/${subfaction._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            subfactionDiv.remove(); // Remove the subfaction from the DOM
            alert(`Subfaction "${subfaction.name}" deleted successfully!`);
          } else {
            alert('Failed to delete subfaction. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting subfaction:', error);
          alert('An error occurred. Please try again.');
        }
      });

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
      option.value = faction._id; // Use the faction ID as the value
      option.textContent = faction.name; // Display the faction name
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
      body: JSON.stringify({ name: subFactionName, faction: selectedFaction }), // Send the faction ID
    });

    if (response.ok) {
      subFactionForm.reset();
      alert('Subfaction added successfully!');
      renderSubfactions(); // Re-render the subfactions
    } else {
      const errorText = await response.text();
      console.error('Failed to add subfaction:', errorText);
      alert(`Failed to add subfaction. Server responded with: ${errorText}`);
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