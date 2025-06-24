document.addEventListener("DOMContentLoaded", () => {
  // --- FILTRO DE OFFER CARDS ---
  const filterButtons = document.querySelectorAll("[data-filter]");
  const offerCards = document.querySelectorAll(".offer-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-filter");

      document.querySelectorAll(".filters-list__item").forEach(item => {
        item.classList.remove("filters-list__item--active");
      });
      button.parentElement.classList.add("filters-list__item--active");

      offerCards.forEach(card => {
        if (category === "all" || card.dataset.category === category) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  const imagePaths = new Array(8).fill('imagenes/ficha.webp');
  offerCards.forEach((card, index) => {
    const imageUrl = imagePaths[index % imagePaths.length];
    card.style.backgroundImage = `url('${imageUrl}')`;
  });

  // --- FILTRO DE TRIPS (ESCRITORIO + MÓVIL/TABLET) ---
  const tripCards = document.querySelectorAll('.trip__card');
  const noResults = document.querySelector('.no-results-message');
  const filtersForms = document.querySelectorAll('.trips__filters, .trips__filters__mobile__tablet');

  const getSelectedFilters = () => {
    const selected = {
      destinos: [],
      actividades: [],
      alojamientos: [],
      precioMin: 0,
      precioMax: Infinity,
    };

    filtersForms.forEach(form => {
      form.querySelectorAll('input[name="destino"]:checked').forEach(input => {
        selected.destinos.push(input.value);
      });
      form.querySelectorAll('input[name="actividad"]:checked').forEach(input => {
        selected.actividades.push(input.value);
      });
      form.querySelectorAll('input[name="alojamiento"]:checked').forEach(input => {
        selected.alojamientos.push(input.value);
      });
      const min = parseFloat(form.querySelector('#precioMin')?.value);
      const max = parseFloat(form.querySelector('#precioMax')?.value);
      if (!isNaN(min)) selected.precioMin = min;
      if (!isNaN(max)) selected.precioMax = max;
    });

    return selected;
  };

  const filterTrips = () => {
    const filters = getSelectedFilters();
    let anyVisible = false;

    tripCards.forEach(card => {
      const destino = card.dataset.destino;
      const actividad = card.dataset.actividad;
      const alojamiento = card.dataset.alojamiento;
      const precio = parseFloat(card.dataset.precio);
      const matchDestino = filters.destinos.length === 0 || filters.destinos.includes(destino);
      const matchActividad = filters.actividades.length === 0 || filters.actividades.includes(actividad);
      const matchAlojamiento = filters.alojamientos.length === 0 || filters.alojamientos.includes(alojamiento);
      const matchPrecio = precio >= filters.precioMin && precio <= filters.precioMax;

      if (matchDestino && matchActividad && matchAlojamiento && matchPrecio) {
        card.style.display = '';
        anyVisible = true;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
  };

  filtersForms.forEach(form => {
    form.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', filterTrips);
    });
    ['#precioMin', '#precioMax'].forEach(id => {
      const input = form.querySelector(id);
      if (input) input.addEventListener('input', filterTrips);
    });
  });

  filterTrips();

  tripCards.forEach(card => {
    const actividad = card.dataset.actividad;
    const span = card.querySelector('.trip__label');
    if (span) span.textContent = actividad;
  });

  document.querySelectorAll('.filters__more').forEach(btnVerMas => {
    btnVerMas.addEventListener('click', e => {
      e.preventDefault();
      const list = btnVerMas.closest('.filters__list');
      const ocultas = list.querySelectorAll('.hidden-actividad');
      const isHidden = ocultas[0]?.style.display === 'none' || ocultas[0]?.style.display === '';
      ocultas.forEach(li => li.style.display = isHidden ? 'list-item' : 'none');
      btnVerMas.textContent = isHidden ? 'Ver menos' : 'Ver más';
    });
  });

  document.querySelectorAll('.filters__toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const block = toggle.closest('.filters__block');
      block.classList.toggle('active');
    });
  });

  const generalToggle = document.querySelector('.filters__toggle__general');
  const filtersWrapper = document.querySelector('.filters__wrapper');

  if (generalToggle && filtersWrapper) {
    generalToggle.addEventListener('click', () => {
      filtersWrapper.classList.toggle('active');
      const icon = generalToggle.querySelector('i');
      icon.classList.toggle('fa-solid fa-filter');
      icon.classList.toggle('fa-solid fa-filter');
    });
  }

// --- POPUP ---
document.querySelectorAll('.trip__details').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const card = link.closest('.trip__card');
    if (card) {
      createPopup(card);
    }
  });
});

const createPopup = (card) => {
  if (document.querySelector('.popup-desglose')) return;

  const destinoText = card.querySelector('.trip__destination')?.textContent || 'Destino no disponible';
  const precio = parseFloat(card.dataset.precio) || 0;
  const impuestos = (precio * 0.10).toFixed(2);
  const precioSinImpuestos = (precio - impuestos).toFixed(2);

  const popup = document.createElement('div');
  popup.classList.add('popup-desglose');
  popup.innerHTML = `
      <div class="popup-content">
        <header class="popup-header">
          <h2>Desglose de precios</h2>
          <button class="popup-close" aria-label="Cerrar">&times;</button>
        </header>
        <div class="popup-body">
          <h3 class="trip__destination">${destinoText}</h3>
          <p>Precio sin impuestos: €${precioSinImpuestos}</p>
          <p>Impuestos: €${impuestos}</p>
        </div>
        <footer class="popup-footer">
          Precio Final: <strong> €${precio.toFixed(2)}</strong>
        </footer>
      </div>
    `;

  // Bloquear scroll al abrir popup
  document.body.style.overflow = 'hidden';

  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.remove();
    const overlay = document.getElementById('popup-overlay');
    if (overlay) overlay.remove();
    // Desbloquear scroll al cerrar popup
    document.body.style.overflow = '';
  });

  document.body.appendChild(popup);

  const overlay = document.createElement('div');
  overlay.id = 'popup-overlay';
  overlay.className = 'popup-overlay';
  overlay.addEventListener('click', () => {
    popup.remove();
    overlay.remove();
    // Desbloquear scroll al cerrar popup
    document.body.style.overflow = '';
  });
  document.body.appendChild(overlay);
};

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('active');

    // Bloquea o habilita scroll dependiendo del estado del menú
    if (isOpen) {
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open'); // <html>
    } else {
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open'); // <html>
    }
  });
}
});

// --- CARRUSEL HERO ---
$(document).ready(function () {
  let currentIndex = 0;
  const slides = $('.hero__slide');
  const totalSlides = slides.length;

  function showSlide(index) {
    slides.removeClass('active').eq(index).addClass('active');
  }

  $('.carousel__control.next').on('click', function () {
    currentIndex = (currentIndex + 1) % totalSlides;
    showSlide(currentIndex);
  });

  $('.carousel__control.prev').on('click', function () {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    showSlide(currentIndex);
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    showSlide(currentIndex);
  }, 7000);
});
