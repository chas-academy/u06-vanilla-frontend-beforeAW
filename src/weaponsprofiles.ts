interface Weaponsprofile {
  _id: string;
  name: string;
}

let isEditMode = false;
let currentWeaponProfileId: string | null = null; 

export async function fetchWeaponsprofiles(): Promise<Weaponsprofile[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weaponsprofiles');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch weaponsprofiles: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderWeaponsprofiles() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const weaponsprofiles = await fetchWeaponsprofiles();
    if (weaponsprofiles.length === 0) {
      contentDiv.textContent = 'No factions found.';
      return;
    }

    contentDiv.innerHTML = '';

    weaponsprofiles.forEach((weaponsprofile) => {
      const weaponsprofileDiv = document.createElement('div');
      weaponsprofileDiv.className = 'p-4 border rounded mb-2';
      weaponsprofileDiv.innerHTML = `
        <h2>${weaponsprofile.name}</h2>
        <br>
        <button class="edit-weapon-profile-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-weapon-profile-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = weaponsprofileDiv.querySelector('.edit-weapon-profile-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current weapons profile's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const weaponProfileNameInput = document.getElementById('weapon-profile-name') as HTMLInputElement;

        modal.classList.remove('hidden'); // Show the modal
        weaponProfileNameInput.value = weaponsprofile.name; // Populate the name

        isEditMode = true; // Set edit mode to true
        currentWeaponProfileId = weaponsprofile._id; // Store the ID of the weapon profile being edited
      });

      // Add Delete functionality
      const deleteButton = weaponsprofileDiv.querySelector('.delete-weapon-profile-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the weapon profile "${weaponsprofile.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/weaponsprofiles/${weaponsprofile._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            weaponsprofileDiv.remove(); // Remove the weapons profile from the DOM
            alert(`Weapon profile "${weaponsprofile.name}" deleted successfully!`);
          } else {
            alert('Failed to delete weapon profile. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting weapon profile:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(weaponsprofileDiv);
    });
  } catch (error) {
    console.error('Error rendering weaponsprofiles:', error);
    contentDiv.textContent = `Failed to load weaponsprofiles. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderWeaponsprofiles();

  const weaponProfileForm = document.getElementById('add-weapon-profile-form') as HTMLFormElement;
  if (weaponProfileForm) {
    weaponProfileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const weaponProfileNameInput = document.getElementById('weapon-profile-name') as HTMLInputElement;
      const weaponProfileName = weaponProfileNameInput?.value ?? '';

      try {
        if (isEditMode && currentWeaponProfileId) {
          // Handle update (PUT request)
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/weaponsprofiles/${currentWeaponProfileId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: weaponProfileName }),
          });

          if (response.ok) {
            alert(`Weapon profile updated successfully!`);
            isEditMode = false; // Reset edit mode
            currentWeaponProfileId = null; // Clear the current ID
            weaponProfileForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderWeaponsprofiles(); // Re-render the weapons profiles
          } else {
            alert('Failed to update weapon profile. Please try again.');
          }
        } else {
          // Handle add (POST request)
          const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weaponsprofiles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: weaponProfileName }),
          });

          if (response.ok) {
            alert('Weapon profile added successfully!');
            weaponProfileForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderWeaponsprofiles(); // Re-render the weapons profiles
          } else {
            alert('Failed to add weapon profile. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[weaponsprofiles.js] add-weapon-profile-form not found on this page – skipping.');
  }
});