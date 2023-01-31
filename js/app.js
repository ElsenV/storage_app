//BUTTONS
const addBtn = document.getElementById("addBtn");
const searchBtn = document.getElementById("searchBtn");
const saveBtn = document.getElementById("saveBtn");
//INPUTS DATA
const productExpireDateInput = document.getElementById(
  "product_exire_date_input"
);
const productNameInput = document.getElementById("product_name");
const productCountInput = document.getElementById("product_count");

//SEARCH INPUTS DATA
const searchForProductInput = document.getElementById("search_product");
const searchForExpireDateInput = document.getElementById("search_for_date");

const searchTable = document.getElementById("search_table");
const bodyTable = document.getElementById("bodytable");
const clearAllTable = document.getElementById("clearAllTable");

const tableProducts = [];

event_Listener();
//! EVENT LISTENERS
function event_Listener() {
  addBtn.addEventListener("click", check_Inputs);
  searchBtn.addEventListener("click", find_Data);
  clearAllTable.addEventListener("click", clear_Table);

  searchForProductInput.addEventListener("keyup", filter_Search);
}

//! CHECK INPUTS FOR ERRORS
function check_Inputs() {
  const newproductNameInput = productNameInput.value.trim().toLowerCase();
  const newproductCountInput = productCountInput.value.trim();
  const newExpireDataInput = productExpireDateInput.value;

  try {
    if (!newproductNameInput)
      throw show_Alert("Product Name not added", "danger");
    if (!newproductCountInput)
      throw show_Alert("Product Count not added", "danger");
    if (!newExpireDataInput)
      throw show_Alert("Product Expire Date not added", "danger");

    add_Data_To_Db(
      newproductNameInput,
      newproductCountInput,
      newExpireDataInput
    );
  } catch (error) {
    show_Alert(`${error.message}`, "danger");
  }
}

//! ADD DATA TO LOCATSTORAGE
function add_Data_To_Db(productName, count, expireDate) {
  const id = new Date().getTime();

  clear_Inputs();

  const addedProducts = {
    Product_Name: productName,
    Count: count,
    Expire_Date: expireDate,
    id: id,
  }; //! -----------------------------------
  const Product = JSON.parse(localStorage.getItem("Products")) || [];
  const findedproduct = Product.some(
    (product) =>
      product.Product_Name === productName && product.Expire_Date === expireDate
  );

  if (findedproduct) {
    Product.map((product) =>
      product.Product_Name === productName && product.Expire_Date === expireDate
        ? (product.Count = Number(product.Count) + Number(count))
        : product
    );
  } else {
    Product.push(addedProducts);
  }

  localStorage.setItem("Products", JSON.stringify(Product));

  show_Alert(`${productName} added`, "success");

  added_Table(addedProducts);
  setTimeout(() => {
    reset_Table_For_Added();
  }, 2000);
}

//!FIND PRODUCT
function find_Data() {
  const newsearchForProductInput = searchForProductInput.value
    .trim()
    .toLowerCase();

  const newsearchForExpireDateInput = searchForExpireDateInput.value;
  try {
    if (!newsearchForProductInput && !newsearchForExpireDateInput)
      throw show_Alert("Add product name or expire date", "danger");
  } catch (error) {
    show_Alert(`${error.message}`, "danger");
  }
  const toDate = new Date(newsearchForExpireDateInput);
  toDate.setHours(0, 0, 0, 0);

  const Product = JSON.parse(localStorage.getItem("Products")) || [];

  Product.filter((product) => {
    //
    const fromDate = new Date(product.Expire_Date);
    fromDate.setHours(0, 0, 0, 0);
    //

    if (product.Product_Name === newsearchForProductInput) {
      check_Table(product);
      // body_Table(product);
    } else if (fromDate <= toDate) {
      check_Table(product);
      // body_Table(product);
    }
  });
  bodyTable.firstElementChild
    ? (clearAllTable.style.visibility = "visible")
    : (clearAllTable.style.visibility = "hidden");

  clear_Inputs();
}

//! SHOW ALERT
function show_Alert(msg, className) {
  const alert = document.getElementById("alertDiv");

  const div = document.createElement("div");
  div.className = `alert alert-${className}`;
  alert.appendChild(div);
  div.innerHTML += msg;

  setTimeout(() => div.remove(), 2000);
}

//! SHOW ADDED PRODUCT TABLE
function added_Table(addedProduct) {
  bodyTable.innerHTML += `
  <tr key=${addedProduct.id} class="text-center">
   <td >${addedProduct.Product_Name}</td>
   <td>${addedProduct.Count}</td>
   <td>${addedProduct.Expire_Date}</td>
  </tr>`;
}

//! CHECK FOR TABLE PRODUCTS
function check_Table(product) {
  if (tableProducts.length === 0) {
    tableProducts.push(product);
  } else if (tableProducts.length > 0) {
    const findedProduct = tableProducts.some(
      (hasTableProduct) => hasTableProduct.id === product.id
    );

    if (findedProduct) {
      return tableProducts;
    } else {
      tableProducts.push(product);
    }
  }
  body_Table(tableProducts);
}

//! SEARCHED PRODUCTS BODY TABLE
function body_Table(tableProducts) {
  bodyTable.innerHTML = "";

  tableProducts.map((product) => {
    bodyTable.innerHTML += `
      <tr key=${product.id} class="text-center">
       <td>${product.Product_Name}</td>
       <td>${product.Count}</td>
       <td>${product.Expire_Date}</td>

       <td> <button type="button" 
       onclick=edit_Product(${product.id}) id="editBTN"  class="btn btn-success m-2" >Edit</button>
       </td>

       <td> <button type="button" 
       onclick=remove_Table_Item(${product.id}) class="btn btn-danger m-1 ">Delete</button>
       </td>
      </tr>
      
      `;
  });

  if (window.innerHeight > 100) {
    bodyTable.parentElement.parentElement.classList.add("scrollable");
  }
}

//!EDIT PRODUCT
function edit_Product(id) {
  const allEditButtons = document.querySelectorAll("#editBTN");
  const editBtn = event.target;
  for (const btn of allEditButtons) {
    btn.disabled = true;
  }

  const expireDate = editBtn.parentElement.previousElementSibling;
  const productCount = expireDate.previousElementSibling;
  const productName = productCount.previousElementSibling;

  productNameInput.value = productName.innerHTML;
  productCountInput.value = productCount.innerHTML;
  productExpireDateInput.value = expireDate.innerHTML;

  addBtn.style.display = "none";
  saveBtn.style.display = "block";

  saveBtn.addEventListener(
    "click",
    function () {
      add_Edited_Product(id, allEditButtons);
    },
    { once: true }
  );
}

function add_Edited_Product(id, allEditButtons) {
  const editedProduct = {
    Product_Name: productNameInput.value.trim().toLowerCase(),
    Count: productCountInput.value.trim(),
    Expire_Date: productExpireDateInput.value,
    id: id,
  };

  tableProducts.map((product) => {
    product.id === id
      ? ((product.Product_Name = editedProduct.Product_Name),
        (product.Count = editedProduct.Count),
        (product.Expire_Date = editedProduct.Expire_Date),
        (product.id = editedProduct.id))
      : product;
  });

  const Products = JSON.parse(localStorage.getItem("Products"));
  Products.map((product) => {
    product.id === id
      ? ((product.Product_Name = editedProduct.Product_Name),
        (product.Count = editedProduct.Count),
        (product.Expire_Date = editedProduct.Expire_Date),
        (product.id = editedProduct.id))
      : product;
  });
  localStorage.setItem("Products", JSON.stringify(Products));

  body_Table(tableProducts);
  addBtn.style.display = "block";
  saveBtn.style.display = "none";
  for (const btn of allEditButtons) {
    btn.disabled = false;
  }
}

//! RESET TABLE
function reset_Table() {
  bodyTable.deleteRow(0);
}

function reset_Table_For_Added() {
  bodyTable.deleteRow(-1);
}

//! CLEAR FOUNDED TABLE
function clear_Table() {
  bodyTable.remove();

  clearAllTable.style.visibility = "hidden";
  window.location.reload();
}

//! REMOVE TABLE ITEMS
function remove_Table_Item(id) {
  const btn = window.event.target;
  btn.parentElement.parentElement.remove();
  let findindex = tableProducts.findIndex((product) => product.id === id);
  tableProducts.splice(findindex, 1);

  let Product = JSON.parse(localStorage.getItem("Products"));
  Product = Product.filter((product) => product.id !== id);
  localStorage.setItem("Products", JSON.stringify(Product));
  bodyTable.firstElementChild
    ? (clearAllTable.style.visibility = "visible")
    : (clearAllTable.style.visibility = "hidden");
}

//! RESET INPUTS VALUE
function clear_Inputs() {
  productNameInput.value = "";
  productCountInput.value = "";
  productExpireDateInput.value = "";

  if (searchForProductInput || searchForExpireDateInput) {
    searchForProductInput.value = "";
    searchForExpireDateInput.value = "";
  }
}
