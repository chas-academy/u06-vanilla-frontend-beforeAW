interface WeaponProfile {
  name: string;
}

interface Weapon {
  _id: string;
  name: string;
  type: string;
  range: string;
  attacks: number;
  skill: number;
  strength: number;
  armorPenetration: number;
  damage: string;
  weaponsprofile: WeaponProfile | WeaponProfile[]; 
}

let isEditMode = false;
let currentWeaponId: string | null = null; 

export async function fetchWeapons(): Promise<Weapon[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch weapons: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderWeapons() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const weapons = await fetchWeapons();
    if (weapons.length === 0) {
      contentDiv.textContent = 'No weapons found.';
      return;
    }

    contentDiv.innerHTML = '';

    weapons.forEach((weapon) => {
      const weaponDiv = document.createElement('div');
      weaponDiv.className = 'p-4 border rounded mb-2';
      weaponDiv.innerHTML = `
      <h2>${weapon.name}</h2>
      <p>Type: ${weapon.type}</p>
      <p>Range: ${weapon.range}</p>
      <p>Attacks: ${weapon.attacks}</p>
      <p>Skill: ${weapon.skill}+</p>
      <p>Strength: ${weapon.strength}</p>
      <p>Armor Penetration: ${weapon.armorPenetration}</p>
      <p>Damage: ${weapon.damage}</p>
      <p>Weapon Profiles:</p>
  <ul>
    ${
      weapon.weaponsprofile
        ? Array.isArray(weapon.weaponsprofile)
          ? weapon.weaponsprofile
              .map((profile) => `<li>${profile?.name || 'Unnamed Profile'}</li>`)
              .join('')
          : weapon.weaponsprofile.name
          ? `<li>${weapon.weaponsprofile.name}</li>`
          : '<li>No weapon profiles available</li>'
        : '<li>No weapon profiles available</li>'
    }
  </ul>
      <br>
      <button class="edit-weapon-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
      Edit
      </button>
      <button class="delete-weapon-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
      Delete
      </button>
      `;

      // Add Edit functionality
      const editButton = weaponDiv.querySelector('.edit-weapon-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current weapon's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const weaponNameInput = document.getElementById('weapon-name') as HTMLInputElement;
        const weaponTypeInput = document.getElementById('weapon-type') as HTMLInputElement;
        const weaponRangeInput = document.getElementById('weapon-range') as HTMLInputElement;
        const weaponAttacksInput = document.getElementById('weapon-attacks') as HTMLInputElement;
        const weaponSkillInput = document.getElementById('weapon-skill') as HTMLInputElement;
        const weaponStrengthInput = document.getElementById('weapon-strength') as HTMLInputElement;
        const weaponArmorPenetrationInput = document.getElementById('weapon-armor-penetration') as HTMLInputElement;
        const weaponDamageInput = document.getElementById('weapon-damage') as HTMLInputElement;
        const weaponProfileDropdown = document.getElementById('weapon-profile-dropdown') as HTMLSelectElement;

        modal.classList.remove('hidden'); // Show the modal
        weaponNameInput.value = weapon.name;
        weaponTypeInput.value = weapon.type;
        weaponRangeInput.value = weapon.range;
        weaponAttacksInput.value = weapon.attacks.toString();
        weaponSkillInput.value = weapon.skill.toString();
        weaponStrengthInput.value = weapon.strength.toString();
        weaponArmorPenetrationInput.value = weapon.armorPenetration.toString();
        weaponDamageInput.value = weapon.damage;

        if (weapon.weaponsprofile) {
          if (Array.isArray(weapon.weaponsprofile)) {
            weaponProfileDropdown.value = weapon.weaponsprofile[0]?.name || '';
          } else {
            weaponProfileDropdown.value = weapon.weaponsprofile.name || '';
          }
        } else {
          weaponProfileDropdown.value = ''; // Default to empty if no profile exists
        }

          isEditMode = true; // Set edit mode to true
          currentWeaponId = weapon._id; // Store the ID of the weapon being edited
        });

      // Add Delete functionality
      const deleteButton = weaponDiv.querySelector('.delete-weapon-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the weapon "${weapon.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons/${weapon._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            weaponDiv.remove(); // Remove the weapon from the DOM
            alert(`Weapon "${weapon.name}" deleted successfully!`);
          } else {
            alert('Failed to delete weapon. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting weapon:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(weaponDiv);
    });
  } catch (error) {
    console.error('Error rendering weapons:', error);
    contentDiv.textContent = `Failed to load weapons. Error: ${error}`;
  }
}

export async function populateWeaponsProfilesDropdown() {
  const dropdown = document.getElementById('weapon-profile-dropdown') as HTMLSelectElement;
  if (!dropdown) {
    console.error('Weapon profile dropdown not found');
    return;
  }

  try {
    const { fetchWeaponsprofiles } = await import('./weaponsprofiles.js'); // Dynamically import fetchWeaponsprofiles
    const weaponsProfiles = await fetchWeaponsprofiles();
    weaponsProfiles.forEach((profile) => {
      const option = document.createElement('option');
      option.value = profile._id;
      option.textContent = profile.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating weapon profiles dropdown:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateWeaponsProfilesDropdown();
  renderWeapons();

  const weaponForm = document.getElementById('add-weapon-form') as HTMLFormElement;
  if (weaponForm) {
    weaponForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const weaponNameInput = document.getElementById('weapon-name') as HTMLInputElement;
      const weaponTypeInput = document.getElementById('weapon-type') as HTMLInputElement;
      const weaponRangeInput = document.getElementById('weapon-range') as HTMLInputElement;
      const weaponAttacksInput = document.getElementById('weapon-attacks') as HTMLInputElement;
      const weaponSkillInput = document.getElementById('weapon-skill') as HTMLInputElement;
      const weaponStrengthInput = document.getElementById('weapon-strength') as HTMLInputElement;
      const weaponArmorPenetrationInput = document.getElementById('weapon-armor-penetration') as HTMLInputElement;
      const weaponDamageInput = document.getElementById('weapon-damage') as HTMLInputElement;
      const weaponProfileDropdown = document.getElementById('weapon-profile-dropdown') as HTMLSelectElement;

      try {
        if (isEditMode && currentWeaponId) {
          // Handle update (PUT request)
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons/${currentWeaponId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: weaponNameInput.value,
              type: weaponTypeInput.value,
              range: weaponRangeInput.value,
              attacks: parseInt(weaponAttacksInput.value, 10),
              skill: parseInt(weaponSkillInput.value, 10),
              strength: parseInt(weaponStrengthInput.value, 10),
              armorPenetration: parseInt(weaponArmorPenetrationInput.value, 10),
              damage: weaponDamageInput.value,
              weaponsprofile: weaponProfileDropdown.value || null,
            }),
          });

          if (response.ok) {
            alert(`Weapon updated successfully!`);
            isEditMode = false; // Reset edit mode
            currentWeaponId = null; // Clear the current ID
            weaponForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderWeapons(); // Re-render the weapons
          } else {
            alert('Failed to update weapon. Please try again.');
          }
        } else {
          // Handle add (POST request)
          const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: weaponNameInput.value,
              type: weaponTypeInput.value,
              range: weaponRangeInput.value,
              attacks: parseInt(weaponAttacksInput.value, 10),
              skill: parseInt(weaponSkillInput.value, 10),
              strength: parseInt(weaponStrengthInput.value, 10),
              armorPenetration: parseInt(weaponArmorPenetrationInput.value, 10),
              damage: weaponDamageInput.value,
              profile: weaponProfileDropdown.value,
            }),
          });

          if (response.ok) {
            alert('Weapon added successfully!');
            weaponForm.reset();
            const modal = document.getElementById('modal');
            if (modal) {
              modal.classList.add('hidden');
            }
            renderWeapons(); // Re-render the weapons
          } else {
            alert('Failed to add weapon. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }
});