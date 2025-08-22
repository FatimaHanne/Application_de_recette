// -------------------- Sélecteurs --------------------
const container = document.getElementById('plats-container');
const title = document.getElementById('category-title');
const grid = document.getElementById('plats-grid');
const btnPlanificateur = document.querySelector(".Planificateur");
const detailContainer = document.getElementById('detail-container');
const mealNameEl = document.getElementById('meal-name');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsEl = document.getElementById('meal-instructions');
const videoContainer = document.getElementById('video-container');
const btnCloseDetail = document.getElementById('btn-close-detail');
const searchInput = document.querySelector('.search-bar input');
const btnSurprise = document.getElementById('btn-surprise');

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

    // Nom
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

    // Image
    const img = document.createElement("img");
    img.src = meal.strMealThumb;
    img.alt = meal.strMeal;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "10px";

    detailContainer.innerHTML = "";
    detailContainer.appendChild(img);
    detailContainer.appendChild(mealNameEl);
    detailContainer.appendChild(ingredientsList);
    detailContainer.appendChild(instructionsEl);

    // Vidéo
    afficherVideoYoutube(meal.strYoutube);

    container.style.display = "none";
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
        await afficherRecette(select.value); // traduction activée ici
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

// -------------------- Afficher recette depuis planner (avec traduction) --------------------
async function afficherRecette(idMeal) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
    const data = await res.json();
    const meal = data.meals[0];

    container.style.display = "none";
    plannerContainer.style.display = "none";
    detailContainer.style.display = "block";

    mealNameEl.textContent = meal.strMeal;

    // Ingrédients traduits
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

    // Instructions traduites
    const simplifiedInstructions = simplifyInstructions(meal.strInstructions);
    const instructionsFR = await translateToFrench(simplifiedInstructions);
    instructionsEl.textContent = instructionsFR;

    // Image
    const img = document.createElement("img");
    img.src = meal.strMealThumb;
    img.alt = meal.strMeal;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "10px";

    detailContainer.innerHTML = "";
    detailContainer.appendChild(img);
    detailContainer.appendChild(mealNameEl);
    detailContainer.appendChild(ingredientsList);
    detailContainer.appendChild(instructionsEl);

    // Vidéo
    afficherVideoYoutube(meal.strYoutube);

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
async function displaySurpriseRecipe(recipe) {
  container.style.display = 'none';
  plannerContainer.style.display = 'none';
  detailContainer.style.display = 'block';

  mealNameEl.textContent = recipe.strMeal;

  const btnVoir = document.createElement('button');
  btnVoir.textContent = "Voir la recette";
  btnVoir.style.display = 'block';
  btnVoir.style.marginTop = '10px';
  btnVoir.style.padding = '8px 12px';
  btnVoir.style.cursor = 'pointer';

  const detailsDiv = document.createElement('div');
  detailsDiv.style.display = 'none';
  detailsDiv.style.marginTop = '10px';

  // Ingrédients traduits
  const ingredientsArray = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') ingredientsArray.push(`${measure ? measure : ''} ${ingredient}`);
  }
  const ingredientsFR = await translateToFrench(ingredientsArray.join(", "));
  const ul = document.createElement('ul');
  ingredientsFR.split(", ").forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });

  // Instructions traduites
  const simplifiedInstructions = simplifyInstructions(recipe.strInstructions);
  const instructionsFR = await translateToFrench(simplifiedInstructions);
  const instructions = document.createElement('p');
  instructions.textContent = instructionsFR;

  detailsDiv.appendChild(ul);
  detailsDiv.appendChild(instructions);

  btnVoir.addEventListener('click', () => {
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
  });

  detailContainer.innerHTML = '';
  const img = document.createElement('img');
  img.src = recipe.strMealThumb;
  img.alt = recipe.strMeal;
  img.style.width = '100%';
  img.style.borderRadius = '8px';
  img.style.marginBottom = '10px';

  detailContainer.appendChild(img);
  detailContainer.appendChild(mealNameEl);
  detailContainer.appendChild(btnVoir);
  detailContainer.appendChild(detailsDiv);

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
