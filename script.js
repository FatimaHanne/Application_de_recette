// Sélecteurs
const container = document.getElementById('plats-container');
const title = document.getElementById('category-title');
const grid = document.getElementById('plats-grid');

const detailContainer = document.getElementById('detail-container');
const mealNameEl = document.getElementById('meal-name');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsEl = document.getElementById('meal-instructions');
const btnCloseDetail = document.getElementById('btn-close-detail');
const videoContainer = document.getElementById('video-container');

function clearGrid() {
  grid.innerHTML = '';
}

function afficherPlats(plats, categoryEmoji, categoryName) {
  container.style.display = 'block';
  detailContainer.style.display = 'none';
  title.textContent = `${categoryEmoji} ${categoryName}`;
  clearGrid();

  plats.forEach(plat => {
    const platCard = document.createElement('div');
    platCard.className = 'plat-card';
      const imgSrc = plat.Image || platsImages[plat.mealName]|| 'images/default.png';
    platCard.innerHTML = `
      <img src="${imgSrc}" alt="${plat.nom}" class="plat-image">
      <h4>${plat.nom}</h4>
    `;

    // Au clic, fetch et afficher détails
    platCard.addEventListener('click', () => {
      afficherDetailsPlat(plat.mealName);
    });

    grid.appendChild(platCard);
  });
}
// Cache en mémoire + localStorage
const translationCache = JSON.parse(localStorage.getItem("translationCache") || "{}");

// Extrait un résumé d'environ maxChars caractères du texte fourni
// function extraireResume(instructions, maxChars = 450) {
//   if (!instructions) return '';

//   const phrases = instructions.match(/[^\.!\?]+[\.!\?]+/g) || [];
//   let resume = '';
//   for (const phrase of phrases) {
//     if ((resume + phrase).length <= maxChars) {
//       resume += phrase.trim() + ' ';
//     } else {
//       break;
//     }
//   }
//   return resume.trim() || instructions.slice(0, maxChars) + '...';
// }

// Fonction robuste pour extraire l'ID vidéo YouTube depuis différentes formes d'URL
// function extraireVideoId(url) {
//   const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([\w-]{11})/;
//   const match = url.match(regex);
//   return match ? match[1] : null;
  
// }

// Fonction pour afficher les plats d'une catégorie en utilisant l'API
async function afficherPlatsDepuisAPI(category, categoryEmoji, categoryName) {
  container.style.display = 'block';
  detailContainer.style.display = 'none';
  title.textContent = `${categoryEmoji} ${categoryName}`;
  clearGrid();

  try {
    // Exemple : on utilise filter.php?c= pour récupérer une catégorie complète
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();

    if (!data.meals) {
      grid.innerHTML = "<p>Aucun plat trouvé.</p>";
      return;
    }

    // Afficher chaque plat comme une carte
    data.meals.forEach(meal => {
      const platCard = document.createElement('div');
      platCard.className = 'plat-card';
      platCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="plat-image">
        <h4>${meal.strMeal}</h4>
      `;

      // Au clic : afficher les détails complets du plat
      platCard.addEventListener('click', () => {
        afficherDetailsPlat(meal.strMeal); // ta fonction existante
      });

      grid.appendChild(platCard);
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des plats :", error);
  }
}

// Quand on clique sur un plat, on récupère ses détails depuis l'API
async function afficherDetailsPlat(mealName) {
  try {
    // Requête API pour chercher le plat par son nom
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealName)}`
    );
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      alert("Aucune information trouvée pour ce plat.");
      return;
    }

    const meal = data.meals[0]; // Le premier résultat

    // Afficher nom du plat
    mealNameEl.textContent = meal.strMeal;

    // Liste des ingrédients
    ingredientsList.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = `${measure ? measure : ""} ${ingredient}`;
        ingredientsList.appendChild(li);
      }
    }

    // Instructions
    instructionsEl.textContent = meal.strInstructions;

    // Afficher la section détails
    container.style.display = "none"; // cacher la liste
    detailContainer.style.display = "block"; // afficher le détail

  } catch (error) {
    console.error("Erreur API:", error);
    alert("Impossible de récupérer les informations.");
  }
}
// Boutons pour afficher depuis l’API
document.getElementById('btn-traditionnels').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Beef", '🍽️', 'Plats Traditionnels'); // exemple catégorie : "Beef"
});
document.getElementById('btn-fastfood').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Chicken", '🍔', 'Fast-food'); // exemple catégorie : "Chicken"
});
document.getElementById('btn-desserts').addEventListener('click', () => {
  afficherPlatsDepuisAPI("Dessert", '🍰', 'Desserts'); // catégorie officielle Dessert
});