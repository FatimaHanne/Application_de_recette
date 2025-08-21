// -------------------- Sélecteurs --------------------
const container = document.getElementById('plats-container');
const title = document.getElementById('category-title');
const grid = document.getElementById('plats-grid');

const detailContainer = document.getElementById('detail-container');
const mealNameEl = document.getElementById('meal-name');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsEl = document.getElementById('meal-instructions');
const videoContainer = document.getElementById('video-container');
const btnCloseDetail = document.getElementById('btn-close-detail');

// -------------------- Fonctions utilitaires --------------------
function clearGrid() {
  grid.innerHTML = '';
}

// Traduction gratuite via Google Translate
async function translateToFrench(text) {
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fr&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error("Erreur traduction :", error);
    return text;
  }
}

// Simplifie les instructions pour les rendre lisibles
function simplifyInstructions(text) {
  const sentences = text.split(/(?<=\.)\s+/);
  return sentences.map(s => s.trim()).join(" ");
}

// Affichage des plats
function afficherPlats(plats, categoryEmoji, categoryName) {
  container.style.display = 'block';
  detailContainer.style.display = 'none';
  title.textContent = `${categoryEmoji} ${categoryName}`;
  clearGrid();

  plats.forEach(plat => {
    const platCard = document.createElement('div');
    platCard.className = 'plat-card';
    const imgSrc = plat.Image || platsImages?.[plat.mealName] || 'images/default.png';
    platCard.innerHTML = `
      <img src="${imgSrc}" alt="${plat.nom}" class="plat-image">
      <h4>${plat.nom}</h4>
    `;
    platCard.addEventListener('click', () => {
      afficherDetailsPlat(plat.mealName);
    });
    grid.appendChild(platCard);
  });
}

// Affichage depuis l'API par catégorie
async function afficherPlatsDepuisAPI(category, categoryEmoji, categoryName) {
  container.style.display = 'block';
  detailContainer.style.display = 'none';
  title.textContent = `${categoryEmoji} ${categoryName}`;
  clearGrid();

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();

    if (!data.meals) {
      grid.innerHTML = "<p>Aucun plat trouvé.</p>";
      return;
    }

    data.meals.forEach(meal => {
      const platCard = document.createElement('div');
      platCard.className = 'plat-card';
      platCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="plat-image">
        <h4>${meal.strMeal}</h4>
      `;
      platCard.addEventListener('click', () => {
        afficherDetailsPlat(meal.strMeal);
      });
      grid.appendChild(platCard);
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des plats :", error);
  }
}

// Affichage vidéo YouTube
function afficherVideoYoutube(youtubeUrl) {
  if (youtubeUrl) {
    const videoId = youtubeUrl.split('v=')[1];
    videoContainer.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    videoContainer.style.display = "block";
  } else {
    videoContainer.innerHTML = "";
    videoContainer.style.display = "none";
  }
}

// Affichage des détails d'un plat
async function afficherDetailsPlat(mealName) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealName)}`
    );
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      alert("Aucune information trouvée pour ce plat.");
      return;
    }

    const meal = data.meals[0];
    mealNameEl.textContent = meal.strMeal;

    // Ingrédients
    ingredientsList.innerHTML = "";
    const ingredientsArray = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredientsArray.push(`${measure ? measure : ""} ${ingredient}`);
      }
    }
    const ingredientsFR = await translateToFrench(ingredientsArray.join(", "));
    ingredientsFR.split(", ").forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ingredientsList.appendChild(li);
    });

    // Instructions
    const simplifiedInstructions = simplifyInstructions(meal.strInstructions);
    const instructionsFR = await translateToFrench(simplifiedInstructions);
    instructionsEl.textContent = instructionsFR;

    // Vidéo
    afficherVideoYoutube(meal.strYoutube);

    // Afficher détails
    container.style.display = "none";
    detailContainer.style.display = "block";

  } catch (error) {
    console.error("Erreur API:", error);
    alert("Impossible de récupérer les informations.");
  }
}

// -------------------- Événements boutons --------------------
document.getElementById('btn-traditionnels').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Beef", '🍽️', 'Plats Traditionnels');
});
document.getElementById('btn-fastfood').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Chicken", '🍔', 'Fast-food');
});
document.getElementById('btn-desserts').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Dessert", '🍰', 'Desserts');
});

// -------------------- Bouton fermeture détails --------------------
btnCloseDetail.addEventListener('click', () => {
  detailContainer.style.display = "none";
  videoContainer.innerHTML = ""; // Supprime vidéo à la fermeture
  videoContainer.style.display = "none";
  container.style.display = "block";
});
