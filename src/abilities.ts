interface Ability {
  _id: string;
  name: string;
  description: string;
}

let isEditMode = false;
let currentAbilityId: string | null = null;

async function fetchAbilities(): Promise<Ability[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch abilities: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderAbilities() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const abilities = await fetchAbilities();
    if (abilities.length === 0) {
      contentDiv.textContent = 'No abilities found.';
      return;
    }

    contentDiv.innerHTML = '';

    abilities.forEach((ability) => {
      const abilityDiv = document.createElement('div');
      abilityDiv.className = 'p-4 border rounded mb-2';
      abilityDiv.innerHTML = ` 
        <h2>${ability.name}</h2>
        <p>${ability.description}</p>
        <br>
        <button class="edit-ability-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
        Edit
        </button>
        <button class="delete-ability-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
        Delete
        </button>
      `;
        // Add Edit functionality
      const editButton = abilityDiv.querySelector('.edit-ability-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current ability's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const abilityNameInput = document.getElementById('ability-name') as HTMLInputElement;
        const abilityDescriptionInput = document.getElementById('ability-description') as HTMLTextAreaElement;

        modal.classList.remove('hidden'); // Show the modal
        abilityNameInput.value = ability.name; // Populate the name
        abilityDescriptionInput.value = ability.description; // Populate the description

        isEditMode = true; // Set edit mode to true
        currentAbilityId = ability._id; // Store the ID of the ability being edited
      });

      // Add Delete functionality
      const deleteButton = abilityDiv.querySelector('.delete-ability-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the ability "${ability.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities/${ability._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            abilityDiv.remove(); // Remove the ability from the DOM
            alert(`Ability "${ability.name}" deleted successfully!`);
          } else {
            alert('Failed to delete ability. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting ability:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(abilityDiv);
    });
  } catch (error) {
    console.error('Error rendering abilities:', error);
    contentDiv.textContent = `Failed to load abilities. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderAbilities();

  const abilityForm = document.getElementById('add-ability-form') as HTMLFormElement;
  if (abilityForm) {
    abilityForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const abilityNameInput = document.getElementById('ability-name') as HTMLInputElement;
      const abilityDescriptionInput = document.getElementById('ability-description') as HTMLTextAreaElement;
      const abilityName = abilityNameInput?.value ?? '';
      const abilityDescription = abilityDescriptionInput?.value ?? '';

      try {
        if (isEditMode && currentAbilityId) {
          // Handle update (PUT request)
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities/${currentAbilityId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: abilityName, description: abilityDescription }),
          });

          if (response.ok) {
            alert(`Ability updated successfully!`);
            isEditMode = false; // Reset edit mode
            currentAbilityId = null; // Clear the current ID
            abilityForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderAbilities(); // Re-render the abilities
          } else {
            alert('Failed to update ability. Please try again.');
          }
        } else {
          // Handle add (POST request)
          const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: abilityName, description: abilityDescription }),
          });

          if (response.ok) {
            alert('Ability added successfully!');
            abilityForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderAbilities(); // Re-render the abilities
          } else {
            alert('Failed to add ability. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[abilities.ts] add-ability-form not found on this page – skipping.');
  }
});