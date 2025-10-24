function getPokeData() {
  const pokeInput = document.getElementById("poke_input").value;
  fetch("https://pokeapi.co/api/v2/pokemon/" + pokeInput)
    .then((response) => {
      if (!response.ok) {
        document.getElementById("poke_data").innerHTML = "Pokémon not found!";
        throw new Error("Pokémon not found!");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("poke_data").innerHTML =
        "<img src='" + data.sprites.front_default + "'>";
      document.getElementById("poke_name").innerHTML = data.name;
    });
}
