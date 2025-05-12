// Select elements
const buttons = document.querySelectorAll(".card__button");
const cartCount = document.getElementById("count");
const asideImage = document.querySelector(".aside__image");
const asideText = document.querySelector(".aside__container p");
const asideList = document.querySelector(".list");
const listTemplate = document.querySelector(".list__item");
const totalDisplay = document.getElementById("total-amount");
const confirmButton = document.querySelector(".aside__confirm");
const asideFooter = document.querySelector(".aside__footer");

let cartItems = [];

// Function to build thumbnail path using subtitle
function getThumbnail(subtitle) {
  const formatted = subtitle.toLowerCase().replace(/\s+/g, "-");
  return `assets/images/image-${formatted}-thumbnail.jpg`;
}

// Loop through all buttons
buttons.forEach((button) => {
  const icons = button.querySelector(".card__icons");
  const count = button.querySelector(".card__count");
  const plus = button.querySelector(".card__plus-icon");
  const minus = button.querySelector(".card__minus-icon");
  const item = button.closest(".card__item");
  const image = item.querySelector("img");
  const subtitle = item.querySelector(".card__subtitle").textContent;
  const price = parseFloat(item.querySelector(".card__price").textContent.replace("$", "")); // Converts it into a number because the dollar sign is not a number!

  button.quantity = 0;  // It’s declared inside the loop, so each button has its own separate quantity value.

  button.addEventListener("click", () => {
    if (button.quantity === 0) { // if the item is not in the cart yet
      button.quantity = 1; // it's now in the cart.
      button.classList.add("active");
      button.childNodes[0].nodeValue = "";
      icons.style.display = "flex";
      count.textContent = button.quantity;
      image.style.border = "2px solid hsl(14, 86%, 42%)";
      addItem(subtitle, price, button.quantity);
    }
  });

  plus.addEventListener("click", (e) => {
    e.stopPropagation(); // This makes sure only the plus icon's function runs (not parent)
    button.quantity++;
    count.textContent = button.quantity;
    updateItem(subtitle, button.quantity);
  });

  minus.addEventListener("click", (e) => {
    e.stopPropagation();
    if (button.quantity > 1) {
      button.quantity--;
      count.textContent = button.quantity;
      updateItem(subtitle, button.quantity);
    } else {
      button.quantity = 0;
      button.classList.remove("active");
      button.childNodes[0].nodeValue = "Add to Cart";
      icons.style.display = "none";
      image.style.border = "none";
      removeItem(subtitle);
      const existing = document.querySelector(`.list__item[data-key='${subtitle}']`);
      if (existing) existing.remove();
    }
  });
});

// Add item
function addItem(key, price, quantity) {
  asideImage.style.display = "none";
  asideText.style.display = "none";
  confirmButton.classList.remove("aside__confirm-hidden");
  asideFooter.style.display = "block";

  const clone = listTemplate.cloneNode(true);
  clone.style.display = "block";
  clone.setAttribute("data-key", key);
  clone.querySelector(".list__name").textContent = key;
  clone.querySelector(".list__quantity").textContent = `${quantity}x`;
  clone.querySelector(".list__price").textContent = `$${price.toFixed(2)}`;
  clone.querySelector(".list__total").textContent = `$${(price * quantity).toFixed(2)}`;

  clone.querySelector(".list__delete").addEventListener("click", () => {
    removeItem(key);
    const li = document.querySelector(`.list__item[data-key='${key}']`);
    if (li) li.remove();

    buttons.forEach((button) => {
      const item = button.closest(".card__item");
      const sub = item.querySelector(".card__subtitle").textContent;
      const image = item.querySelector("img");
      if (sub === key) {
        button.classList.remove("active");
        button.querySelector(".card__icons").style.display = "none";
        button.childNodes[0].nodeValue = "Add to Cart";
        button.quantity = 0;
        image.style.border = "none";
      }
    });
  });

  asideList.appendChild(clone);
  cartItems.push({ key, price, quantity });
  updateCart();
}

// Update item quantity
function updateItem(key, quantity) {
  const item = cartItems.find(i => i.key === key);
  if (!item) return; // This is a guard clause to prevent errors.
  item.quantity = quantity;

  const li = document.querySelector(`.list__item[data-key='${key}']`);
  if (li) {
    li.querySelector(".list__quantity").textContent = `${quantity}x`;
    li.querySelector(".list__total").textContent = `$${(item.price * quantity).toFixed(2)}`;
  }

  updateCart();
}

// Remove item
function removeItem(key) {
  cartItems = cartItems.filter(i => i.key !== key);
  updateCart();
}

// Update cart count and total
function updateCart() {
  const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  cartCount.textContent = `(${totalQuantity})`;
  totalDisplay.textContent = `$${totalPrice.toFixed(2)}`;

  if (totalQuantity === 0) {
    asideImage.style.display = "block";
    asideText.style.display = "block";
    asideFooter.style.display = "none";
    confirmButton.classList.add("aside__confirm-hidden");
  }
}

// Confirmation logic
const confirmationSection = document.querySelector(".confirmation");
const confirmationList = document.querySelector(".confirmation__list");
const confirmationTotal = document.getElementById("total-amount");
const startNewOrderBtn = document.querySelector(".confirmation__button");

confirmButton.addEventListener("click", () => {
  confirmationList.innerHTML = "";

  let total = 0;

  cartItems.forEach(item => {
    const li = document.createElement("li");
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    li.classList.add("confirmation__list-item");
    li.innerHTML = `
      <img src="${getThumbnail(item.key)}" alt="${item.key}">
      <div class="item__info">
        <p class="list__name">${item.key}</p>
        <div class="item__details">
          <div class="item__left">
            <span class="list__quantity">${item.quantity}x</span>
            <span class="list__price">$${item.price.toFixed(2)}</span>
          </div>
          <span class="list__total">$${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
    confirmationList.appendChild(li);
  });

  document.querySelector(".confirmation__summary #total-amount").textContent = `$${total.toFixed(2)}`;
  confirmationSection.classList.remove("confirmation__hidden");
  document.body.style.overflow = "hidden";
});

// Start new order
startNewOrderBtn.addEventListener("click", () => {
  confirmationSection.classList.add("confirmation__hidden");
  document.body.style.overflow = "auto";

  cartItems = [];
  asideList.innerHTML = "";
  cartCount.textContent = "(0)";
  totalDisplay.textContent = "$0.00";
  asideImage.style.display = "block";
  asideText.style.display = "block";
  asideFooter.style.display = "none";
  confirmButton.classList.add("aside__confirm-hidden");

  buttons.forEach(button => {
    const item = button.closest(".card__item");
    const image = item.querySelector("img");
    const icons = button.querySelector(".card__icons");

    button.classList.remove("active");
    button.childNodes[0].nodeValue = "Add to Cart";
    icons.style.display = "none";
    image.style.border = "none";
    button.quantity = 0;
  });
});
