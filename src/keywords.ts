interface Keyword {
  _id: string;
  name: string;
}

async function fetchKeywords(): Promise<Keyword[]> {
  const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords');
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch keywords: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

async function renderKeywords() {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) {
    console.error('Content div not found');
    return;
  }

  try {
    const keywords = await fetchKeywords();
    if (keywords.length === 0) {
      contentDiv.textContent = 'No keywords found.';
      return;
    }

    keywords.forEach((keyword) => {
      const keywordDiv = document.createElement('div');
      keywordDiv.className = 'p-4 border rounded mb-2';
      keywordDiv.innerHTML = `
        <h2>${keyword.name}</h2>
        <br>
        <button class="edit-keyword-btn bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white transition">
          Edit
        </button>
        <button class="delete-keyword-btn bg-red-700 text-gray-300 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      `;

      // Add Edit functionality
      const editButton = keywordDiv.querySelector('.edit-keyword-btn') as HTMLButtonElement;
      editButton.addEventListener('click', () => {
        // Open the modal and populate it with the current keyword's data
        const modal = document.getElementById('modal') as HTMLDivElement;
        const keywordNameInput = document.getElementById('keyword-name') as HTMLInputElement;

        modal.classList.remove('hidden'); // Show the modal
        keywordNameInput.value = keyword.name; // Populate the name

        // Update the form submission to handle PUT
        const form = document.getElementById('add-keyword-form') as HTMLFormElement;
        form.onsubmit = async (event) => {
          event.preventDefault();

          try {
            const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords/${keyword._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: keywordNameInput.value,
              }),
            });

            if (response.ok) {
              alert(`Keyword "${keyword.name}" updated successfully!`);
              modal.classList.add('hidden'); // Hide the modal
              renderKeywords(); // Re-render the keywords
            } else {
              alert('Failed to update keyword. Please try again.');
            }
          } catch (error) {
            console.error('Error updating keyword:', error);
            alert('An error occurred. Please try again.');
          }
        };
      });

      // Add Delete functionality
      const deleteButton = keywordDiv.querySelector('.delete-keyword-btn') as HTMLButtonElement;
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete the keyword "${keyword.name}"?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords/${keyword._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            keywordDiv.remove(); // Remove the keyword from the DOM
            alert(`Keyword "${keyword.name}" deleted successfully!`);
          } else {
            alert('Failed to delete keyword. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting keyword:', error);
          alert('An error occurred. Please try again.');
        }
      });

      contentDiv.appendChild(keywordDiv);
    });
  } catch (error) {
    console.error('Error rendering keywords:', error);
    contentDiv.textContent = `Failed to load keywords. Error: ${error}`;
  }
}

document.addEventListener('DOMContentLoaded', renderKeywords);

document.addEventListener('DOMContentLoaded', () => {
  const keywordForm = document.getElementById('add-keyword-form');

  if (keywordForm) {
    keywordForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const keywordInput = document.getElementById('keyword-name') as HTMLInputElement;
      const keywordName = keywordInput?.value ?? '';

      try {
        const response = await fetch('https://u05-beforeaw-wh-40k-api.vercel.app/api/keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: keywordName }),
        });

        if (response.ok) {
          (keywordForm as HTMLFormElement).reset();

          const modal = document.getElementById('modal');
          if (modal) {
            modal.classList.add('hidden');
          }

          alert('Keyword added successfully!');
        } else {
          alert('Failed to add keyword. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.log('[keywords.js] add-keyword-form not found on this page – skipping.');
  }
});