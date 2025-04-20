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

async function fetchWeapons(): Promise<Weapon[]> {
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

document.addEventListener('DOMContentLoaded', renderWeapons);