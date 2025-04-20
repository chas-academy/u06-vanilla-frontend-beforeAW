interface Ability {
  name: string;
  description: string;
}

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

    abilities.forEach((ability) => {
      const abilityDiv = document.createElement('div');
      abilityDiv.className = 'p-4 border rounded mb-2';
      abilityDiv.innerHTML = ` 
        <h2>${ability.name}</h2>
        <p>${ability.description}</p>
      `;
      contentDiv.appendChild(abilityDiv);
    });
  } catch (error) {
    console.error('Error rendering abilities:', error);
    contentDiv.textContent = `Failed to load abilities. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderAbilities);

const form = document.getElementById('add-ability-form') as HTMLFormElement;
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const abilityName = (document.getElementById('ability-name') as HTMLInputElement).value;
  const abilityDescription = (document.getElementById('ability-description') as HTMLTextAreaElement).value;

  try {
    const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/abilities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: abilityName, description: abilityDescription }),
    });

    if (response.ok) {
      form.reset();
      modal.classList.add('hidden');
    } else {
      alert('Failed to add ability. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});