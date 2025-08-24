// -------------------- Sélecteurs --------------------
const container = document.getElementById('plats-container');
const title = document.getElementById('category-title');
const grid = document.getElementById('plats-grid');
const btnPlanificateur = document.querySelector(".Planificateur");
const detailContainer = document.getElementById('detail-container');
const mealNameEl = document.getElementById('meal-name');
const mealCountryEl = document.getElementById('meal-country'); // pour le pays
const ingredientsList = document.getElementById('ingredients-list');
const instructionsEl = document.getElementById('meal-instructions');
const videoContainer = document.getElementById('video-container');
const btnCloseDetail = document.getElementById('btn-close-detail');
const searchInput = document.querySelector('.search-bar input');
const btnSurprise = document.getElementById('btn-surprise');
const mealImageEl = document.getElementById('meal-image');

// -------------------- Fonctions utilitaires --------------------
function clearGrid() {
  grid.innerHTML = '';
}

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

function simplifyInstructions(text) {
  const sentences = text.split(/(?<=\.)\s+/);
  return sentences.map(s => s.trim()).join(" ");
}

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

// -------------------- Affichage des plats --------------------
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

// -------------------- Affichage détails plat --------------------
async function afficherDetailsPlat(mealName) {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealName)}`);
    const data = await response.json();
    if (!data.meals || data.meals.length === 0) {
      alert("Aucune information trouvée pour ce plat.");
      return;
    }

    const meal = data.meals[0];

    // Nom et pays
   mealNameEl.textContent = meal.strArea ? `${meal.strMeal} (${meal.strArea})` : meal.strMeal;


    // Image
    mealImageEl.src = meal.strMealThumb;
    mealImageEl.alt = meal.strMeal;

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
    instructionsEl.textContent = await translateToFrench(simplifiedInstructions);

    // Vidéo
    afficherVideoYoutube(meal.strYoutube);

    container.style.display = "none";
    plannerContainer.style.display = "none"; 
    detailContainer.style.display = "block";

  } catch (error) {
    console.error("Erreur API:", error);
    alert("Impossible de récupérer les informations.");
  }
}

// -------------------- Planificateur --------------------
const plannerContainer = document.createElement("div");
plannerContainer.id = "planner";
plannerContainer.style.display = "none";
document.body.appendChild(plannerContainer);
const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

btnPlanificateur.addEventListener("click", () => {
  if (plannerContainer.style.display === "none") {
    afficherPlanner();
    plannerContainer.style.display = "block";
    container.style.display = "none";
    detailContainer.style.display = "none";
  } else {
    plannerContainer.style.display = "none";
  }
});

function afficherPlanner() {
  plannerContainer.innerHTML = "<h2>Planificateur de la semaine</h2>";
  jours.forEach(jour => {
    const jourDiv = document.createElement("div");
    jourDiv.classList.add("jour");
    jourDiv.style.marginBottom = "15px";

    const titre = document.createElement("h3");
    titre.textContent = jour;

    const select = document.createElement("select");
    select.innerHTML = `<option value="">-- Choisir un plat --</option>`;

    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef")
      .then(res => res.json())
      .then(data => {
        data.meals.forEach(meal => {
          const option = document.createElement("option");
          option.value = meal.idMeal;
          option.textContent = meal.strMeal;
          select.appendChild(option);
        });
        const savedMeal = localStorage.getItem(jour);
        if (savedMeal) select.value = savedMeal;
      });

    select.addEventListener("change", () => {
      localStorage.setItem(jour, select.value);
    });

    const btnRecette = document.createElement("button");
    btnRecette.textContent = "Voir la recette";
    btnRecette.style.marginLeft = "10px";

    btnRecette.addEventListener("click", async () => {
      if (select.value) {
        await afficherRecette(select.value); 
      } else {
        alert("Choisis un plat d'abord !");
      }
    });

    jourDiv.appendChild(titre);
    jourDiv.appendChild(select);
    jourDiv.appendChild(btnRecette);
    plannerContainer.appendChild(jourDiv);
  });
}

// -------------------- Afficher recette depuis planner --------------------
async function afficherRecette(idMeal) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
    const data = await res.json();
    const meal = data.meals[0];
    await afficherDetailsPlat(meal.strMeal); 
  } catch (error) {
    console.error("Erreur API:", error);
    alert("Impossible de récupérer les informations.");
  }
}

// -------------------- Boutons catégories --------------------
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
  videoContainer.innerHTML = "";
  videoContainer.style.display = "none";
  container.style.display = "block";
});

// -------------------- Recherche dynamique --------------------
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    grid.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    container.style.display = 'block';
    detailContainer.style.display = 'none';
    clearGrid();

    if (!data.meals) {
      grid.innerHTML = "<p>Aucune recette trouvée.</p>";
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
    console.error("Erreur API:", error);
  }
});

// -------------------- Recette surprise --------------------
async function getRandomRecipe() {
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const data = await res.json();
    return data.meals[0];
  } catch (error) {
    console.error("Erreur lors de la récupération de la recette surprise :", error);
    alert("Impossible de récupérer la recette surprise !");
  }
}

async function displaySurpriseRecipe(recipe) {
  container.style.display = 'none';
  plannerContainer.style.display = 'none';
  detailContainer.style.display = 'block';

 mealNameEl.textContent = recipe.strArea 
  ? `${recipe.strMeal} (${recipe.strArea})` 
  : recipe.strMeal;
  // mealCountryEl.textContent = recipe.strArea ? ` (${recipe.strArea})` : "";
  mealImageEl.src = recipe.strMealThumb;
  mealImageEl.alt = recipe.strMeal;

  // Ingrédients
  ingredientsList.innerHTML = "";
  const ingredientsArray = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') ingredientsArray.push(`${measure ? measure : ''} ${ingredient}`);
  }
  const ingredientsFR = await translateToFrench(ingredientsArray.join(", "));
  ingredientsFR.split(", ").forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  const simplifiedInstructions = simplifyInstructions(recipe.strInstructions);
  instructionsEl.textContent = await translateToFrench(simplifiedInstructions);

  afficherVideoYoutube(recipe.strYoutube);
}

btnSurprise.addEventListener('click', async () => {
  const today = new Date().toISOString().slice(0, 10);
  let recetteDuJour = localStorage.getItem('recetteDuJour');
  let dateRecette = localStorage.getItem('dateRecette');

  if (!recetteDuJour || dateRecette !== today) {
    const recette = await getRandomRecipe();
    localStorage.setItem('recetteDuJour', JSON.stringify(recette));
    localStorage.setItem('dateRecette', today);
    await displaySurpriseRecipe(recette);
  } else {
    const recette = JSON.parse(recetteDuJour);
    await displaySurpriseRecipe(recette);
  }
});
