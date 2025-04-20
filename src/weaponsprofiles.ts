interface Weaponsprofile {
  name: string;
}

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

    weaponsprofiles.forEach((weaponsprofile) => {
      const weaponsprofileDiv = document.createElement('div');
      weaponsprofileDiv.className = 'p-4 border rounded mb-2';
      weaponsprofileDiv.innerHTML = `
        <h2>${weaponsprofile.name}</h2>
      `;
      contentDiv.appendChild(weaponsprofileDiv);
    });
  } catch (error) {
    console.error('Error rendering weaponsprofiles:', error);
    contentDiv.textContent = `Failed to load weaponsprofiles. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderWeaponsprofiles);

document.addEventListener('DOMContentLoaded', () => {
  const weaponProfileForm = document.getElementById('add-weapon-profile-form');

  if (weaponProfileForm) {
    weaponProfileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const weaponprofileNameInput = document.getElementById('weapon-name') as HTMLInputElement;
      const weaponprofileName = weaponprofileNameInput?.value ?? '';

      try {
        const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: weaponprofileName }),
        });

        if (response.ok) {
          (weaponProfileForm as HTMLFormElement).reset();

          const modal = document.getElementById('modal');
          if (modal) {
            modal.classList.add('hidden');
          }

          alert('Weapon profile added successfully!');
        } else {
          alert('Failed to add weapon profile. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[weapons.js] add-weapon-profile-form not found on this page – skipping.');
  }
});