interface WeaponProfile {
  name: string;
}

interface Weapon {
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
            Array.isArray(weapon.weaponsprofile)
              ? weapon.weaponsprofile.map((profile) => `<li>${profile.name}</li>`).join('')
              : `<li>${weapon.weaponsprofile.name}</li>`
          }
        </ul>
      `;
      contentDiv.appendChild(weaponDiv);
    });
  } catch (error) {
    console.error('Error rendering weapons:', error);
    contentDiv.textContent = `Failed to load weapons. Error: ${error}`;
  }
}
async function populateWeaponsProfilesDropdown() {
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
      option.value = profile.name;
      option.textContent = profile.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating weapon profiles dropdown:', error);
  }
}

const weaponForm = document.getElementById('add-weapon-form') as HTMLFormElement;
weaponForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const weaponName = (document.getElementById('weapon-name') as HTMLInputElement).value;
  const weaponType = (document.getElementById('weapon-type') as HTMLInputElement).value;
  const weaponRange = (document.getElementById('weapon-range') as HTMLInputElement).value;
  const weaponAttacks = parseInt((document.getElementById('weapon-attacks') as HTMLInputElement).value, 10);
  const weaponSkill = parseInt((document.getElementById('weapon-skill') as HTMLInputElement).value, 10);
  const weaponStrength = parseInt((document.getElementById('weapon-strength') as HTMLInputElement).value, 10);
  const weaponArmorPenetration = parseInt((document.getElementById('weapon-armor-penetration') as HTMLInputElement).value, 10);
  const weaponDamage = (document.getElementById('weapon-damage') as HTMLInputElement).value;
  const selectedProfile = (document.getElementById('weapon-profile-dropdown') as HTMLSelectElement).value;

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/weapons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: weaponName,
        type: weaponType,
        range: weaponRange,
        attacks: weaponAttacks,
        skill: weaponSkill,
        strength: weaponStrength,
        armorPenetration: weaponArmorPenetration,
        damage: weaponDamage,
        profile: selectedProfile,
      }),
    });

    if (response.ok) {
      weaponForm.reset();
      alert('Weapon added successfully!');
    } else {
      alert('Failed to add weapon. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}); // <-- Closing parenthesis added here

document.addEventListener('DOMContentLoaded', () => {
  populateWeaponsProfilesDropdown();
  renderWeapons();
});