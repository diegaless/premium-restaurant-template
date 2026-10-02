// Translate shared controls while keeping the example's editorial copy intact.
export function localizeInterface(document, config, { observe = true } = {}) {
  if (config.brand.language !== "es") return;
  const dictionary = {
    "Open menu": "Abrir menú",
    "Close menu": "Cerrar menú",
    "Skip to main content": "Saltar al contenido",
    Restaurant: "Restaurante",
    Restaurants: "Restaurantes",
    Reservations: "Reservas",
    Reserve: "Reservar",
    "View all reservations": "Ver todos los restaurantes",
    "Close reservations": "Cerrar reservas",
    "All restaurants": "Todos los restaurantes",
    Region: "Región",
    "All regions": "Todas las regiones",
    Status: "Estado",
    Hours: "Horario",
    Phone: "Teléfono",
    Contact: "Contacto",
    "Open now": "Abiertos",
    "Opening soon": "Próximas aperturas",
    "Search location": "Buscar restaurante",
    "City, region or venue": "Ciudad, región o restaurante",
    "All locations": "Todos los restaurantes",
    "Global directory": "Directorio",
    Location: "Restaurante",
    "All open locations": "Todos los restaurantes abiertos",
    "Showing signature items across open locations.":
      "Mostrando la carta de nuestros restaurantes.",
    "Reserve selected location": "Reservar en este restaurante",
    "Wine List": "Carta de vinos",
    "Menu PDF": "Carta en PDF",
    "No matching items are listed for this location yet.":
      "No hay platos para esta selección.",
    "Global VIP": "Lista de invitados",
    "Global VIP signup": "Lista de invitados",
    "Close Global VIP signup": "Cerrar lista de invitados",
    "Cookies on our website": "Preferencias del sitio",
    "Cookie settings": "Preferencias",
    "Edit settings": "Editar preferencias",
    "We use essential cookies to run the site and optional cookies to understand visits and improve marketing.":
      "Guardamos tus preferencias en este navegador. Puedes revisarlas en cualquier momento.",
    "Accept recommended cookies": "Aceptar preferencias",
    Reject: "Rechazar opcionales",
    "Close cookie settings": "Cerrar preferencias",
    "Necessary cookies": "Necesarias",
    "Analytics cookies": "Estadísticas",
    "Marketing cookies": "Marketing",
    "Save preferences": "Guardar preferencias",
    "Accept all cookies": "Aceptar todas",
    Previous: "Anterior",
    Next: "Siguiente",
    Zoom: "Ampliar",
    Menu: "Carta",
    "Previous item": "Anterior",
    "Next item": "Siguiente",
    "Toggle image zoom": "Ampliar imagen",
    "Scroll to top": "Volver arriba",
    "Privacy policy": "Política de privacidad",
    "Location carousel controls": "Navegación de restaurantes",
    "Previous location": "Restaurante anterior",
    "Next location": "Restaurante siguiente",
    "Previous slide": "Imagen anterior",
    "Next slide": "Imagen siguiente",
    "Previous dish": "Plato anterior",
    "Next dish": "Plato siguiente",
    "Cuisine and drinks": "Cocina y bebidas",
    "Footer links": "Enlaces del pie",
    "Quick actions": "Acciones rápidas",
    Social: "Síguenos",
  };
  const translate = (value) => {
    const trimmed = value.trim();
    if (dictionary[trimmed]) return value.replace(trimmed, dictionary[trimmed]);
    return value
      .replace(/^Choose your (.+)$/, "Elige tu $1")
      .replace(/^Find (.+) by region$/, "Encuentra $1 por región")
      .replace(/^Show (.+)$/, "Mostrar $1")
      .replace(/^(\d+) locations? shown$/, (_, count) =>
        count === "1"
          ? "1 restaurante encontrado"
          : `${count} restaurantes encontrados`,
      )
      .replace(/^(\d+) locations?$/, (_, count) =>
        count === "1" ? "1 restaurante" : `${count} restaurantes`,
      )
      .replace(/^Available in /, "Disponible en ")
      .replace(/^Not listed in /, "No disponible en ")
      .replace(/Allergens: /g, "Alérgenos: ");
  };
  const walk = (node) => {
    if (node.nodeType === 3) {
      const value = translate(node.nodeValue);
      if (value !== node.nodeValue) node.nodeValue = value;
      return;
    }
    if (
      ["SCRIPT", "STYLE"].includes(node.nodeName) ||
      node.classList?.contains("template-editor")
    )
      return;
    for (const attribute of ["aria-label", "placeholder"])
      if (node.hasAttribute?.(attribute)) {
        const old = node.getAttribute(attribute),
          value = translate(old);
        if (value !== old) node.setAttribute(attribute, value);
      }
    for (const child of [...(node.childNodes || [])]) walk(child);
  };
  walk(document.body);
  if (!observe) return;
  new MutationObserver((records) => {
    for (const record of records) {
      if (["characterData", "attributes"].includes(record.type))
        walk(record.target);
      else record.addedNodes.forEach(walk);
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "placeholder"],
  });
}
