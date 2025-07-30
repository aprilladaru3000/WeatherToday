/*SEARCH BY USING A CITY NAME (e.g. athens) OR A COMMA-SEPARATED CITY NAME ALONG WITH THE COUNTRY CODE (e.g. athens,gr)*/
const form = document.querySelector("form");
const input = document.querySelector("input");
const msg = document.querySelector(".msg");
const list = document.querySelector(".cities");
const clearBtn = document.getElementById("clearBtn");
/*SUBSCRIBE HERE FOR API KEY: https://home.openweathermap.org/users/sign_up*/
const apiKey = "9cf5a2cda588279529a36d4d6df4a2ff";

// Clear button functionality
clearBtn.addEventListener("click", () => {
  list.innerHTML = "";
  msg.textContent = "";
  input.focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  let inputVal = input.value;

  //check if there's already a city
  const listItems = list.querySelectorAll(".city");
  const listItemsArray = Array.from(listItems);

  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter(el => {
      let content = "";
      //athens,gr
      if (inputVal.includes(",")) {
        //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el
            .querySelector(".city-name span")
            .textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        //athens
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });

    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well 😉`;
      form.reset();
      input.focus();
      return;
    }
  }

  //ajax here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const { main, name, sys, weather } = data;
      const icon = `https://openweathermap.org/img/wn/${
        weather[0]["icon"]
      }@2x.png`;

      const li = document.createElement("li");
      li.classList.add("city");
      const markup = `
        <div class="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 transform hover:scale-105 transition-all duration-300">
          <div class="text-center">
            <h2 class="city-name text-2xl font-bold text-white mb-2" data-name="${name},${sys.country}">
              <span>${name}</span>
              <sup class="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-2 py-1 rounded-full text-xs ml-2">${sys.country}</sup>
            </h2>
            <div class="city-temp text-5xl font-bold text-white mb-4">
              ${Math.round(main.temp)}<sup class="text-2xl">°C</sup>
            </div>
            <figure class="flex flex-col items-center">
              <img class="city-icon w-20 h-20 mb-2" src="${icon}" alt="${
        weather[0]["description"]
      }">
              <figcaption class="text-white/90 font-medium text-sm uppercase tracking-wider">${weather[0]["description"]}</figcaption>
            </figure>
          </div>
        </div>
      `;
      li.innerHTML = markup;
      list.appendChild(li);
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city 😩";
    });

  msg.textContent = "";
  form.reset();
  input.focus();
});
