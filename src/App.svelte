<script>
  import { onMount } from "svelte";

  let page = "home",
    title = "Recipes";
  let inputVal = "",
    img;
  let recipe = {};

  $: disabled = !inputVal.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  );
  onMount(() => {
    if (new URLSearchParams(location.search).get("url")) {
      load(null, new URLSearchParams(location.search).get("url"), true);
    }
    document.querySelector("input").onpaste = async () => {
      await new Promise((r) => setTimeout(r, 10));
      console.log("Pasted");
      load(null, null, true);
    };
  });
  async function load(_, url, bypass = false) {
    console.log("Loading recipe");
    if (disabled && !bypass) {
      return;
    }
    if (
      !(url || inputVal).match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
      )
    ) {
      return alert("Invalid URL");
    }
    page = "loading";
    recipe = await fetch(
      `https://cors.explosionscratc.repl.co/www.justtherecipe.com/extractRecipeAtUrl?url=${encodeURIComponent(
        url || inputVal
      )}`
    ).then((r) => r.json());
    history.pushState(
      {},
      title,
      `${location.pathname || ""}?url=${url || inputVal}`
    );
    title = recipe.name;
    page = "recipe";
  }
</script>

<svelte:head>
  <title>{title}</title>
  <base href="https://explosion-scratch.github.io/recipes" />
</svelte:head>
{#if page === "home"}
  <input
    spellcheck="false"
    type="text"
    bind:value={inputVal}
    placeholder="Enter a recipe URL"
    on:keyup={(e) => e.key === "Enter" && load()}
  />
  <button on:click={load} {disabled}>Go</button>
{:else if page === "recipe"}
  <div class="container">
    <div id="home" on:click={() => (page = "home")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        role="img"
        class="iconify iconify--clarity"
        width="32"
        height="32"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 36 36"
        ><path
          fill="currentColor"
          d="m33.71 17.29l-15-15a1 1 0 0 0-1.41 0l-15 15a1 1 0 0 0 1.41 1.41L18 4.41l14.29 14.3a1 1 0 0 0 1.41-1.41Z"
          class="clr-i-outline clr-i-outline-path-1"
        /><path
          fill="currentColor"
          d="M28 32h-5V22H13v10H8V18l-2 2v12a2 2 0 0 0 2 2h7V24h6v10h7a2 2 0 0 0 2-2V19.76l-2-2Z"
          class="clr-i-outline clr-i-outline-path-2"
        /><path fill="none" d="M0 0h36v36H0z" /></svg
      >
    </div>
    <div class="column imageColumn">
      {#if recipe.imageUrls[0]}
        <img
          alt={recipe.name + " image"}
          class="recipeImage"
          src={recipe.imageUrls[0]}
          bind:this={img}
          on:error={() =>
            (img.src = `https://cors.explosionscratc.repl.co/${
              img.src.split("//")[1]
            }`)}
        />
      {:else}
        <svg
          class="noImage"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
          ><path
            fill="currentColor"
            d="M40 176V48a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8v112l-42.3-42.3a8 8 0 0 0-11.4 0l-44.6 44.6a8 8 0 0 1-11.4 0l-20.6-20.6a8 8 0 0 0-11.4 0Z"
            opacity=".2"
          /><path
            fill="currentColor"
            d="M88 92a12 12 0 1 1 12 12a12 12 0 0 1-12-12Zm136-44v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16ZM48 156.7L68.7 136a16.1 16.1 0 0 1 22.6 0l20.7 20.7l44.7-44.7a16.1 16.1 0 0 1 22.6 0l28.7 28.7V48H48ZM208 208v-44.7l-40-40l-44.7 44.7a16.1 16.1 0 0 1-22.6 0L80 147.3l-32 32V208Z"
          /></svg
        >
      {/if}
      <h2 class="ingredientsHeader">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="iconify iconify--ph"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
          ><path
            fill="currentColor"
            d="M78 72V32a6 6 0 0 1 12 0v40a6 6 0 0 1-12 0Zm39.9-41a6 6 0 0 0-11.8 2l7.9 47.5a30 30 0 0 1-60 0L61.9 33a6 6 0 1 0-11.8-2l-8 48a3.4 3.4 0 0 0-.1 1a42.2 42.2 0 0 0 36 41.6V224a6 6 0 0 0 12 0V121.6A42.2 42.2 0 0 0 126 80a3.4 3.4 0 0 0-.1-1Zm92.1 1v192a6 6 0 0 1-12 0v-58h-50a6.1 6.1 0 0 1-4.5-2a6.4 6.4 0 0 1-1.5-4.6a412.4 412.4 0 0 1 11.7-59c11.9-41.8 28.1-66.7 48.2-74A6 6 0 0 1 210 32Zm-12 10.1c-25.7 19.4-39.1 81.1-43.2 111.9H198Z"
          /></svg
        >
        Ingredients
      </h2>
      <ul id="ingredients">
        {#each recipe.ingredients as ingredient}
          <li class="ingredient">
            {ingredient.name}
          </li>
        {/each}
      </ul>
    </div>
    <div class="column recipeColumn">
      <h2 class="title"><a href={recipe.sourceUrl}>{recipe.name}</a></h2>
      <div id="details">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="iconify iconify--ph"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
          ><path
            fill="currentColor"
            d="M237.6 78.9a13.9 13.9 0 0 0-3.7-18.9a181.9 181.9 0 0 0-211.8 0a13.9 13.9 0 0 0-3.7 18.9l97.8 153.7a14 14 0 0 0 23.6 0l58.4-91.8h.1ZM29.1 69.7a170.1 170.1 0 0 1 197.8 0a2.1 2.1 0 0 1 .6 2.8l-9.8 15.3a149.9 149.9 0 0 0-179.4 0l-9.8-15.3a2.1 2.1 0 0 1 .6-2.8Zm35.6 59.7a22 22 0 1 1 20.7 32.5Zm65 96.8a2.1 2.1 0 0 1-3.4 0l-33.9-53.3a34 34 0 1 0-34.7-54.5L44.7 98a137.9 137.9 0 0 1 166.6 0l-19.4 30.4a34 34 0 1 0-36.5 57.3Zm32.2-50.7A22 22 0 0 1 172 134a21.5 21.5 0 0 1 13.4 4.6Z"
          /></svg
        >
        {recipe.servings} servings •
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="iconify iconify--ph"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
          ><path
            fill="currentColor"
            d="M128 230a102 102 0 1 1 102-102a102.2 102.2 0 0 1-102 102Zm0-192a90 90 0 1 0 90 90a90.1 90.1 0 0 0-90-90Zm62 90a6 6 0 0 0-6-6h-50V72a6 6 0 0 0-12 0v56a6 6 0 0 0 6 6h56a6 6 0 0 0 6-6Z"
          /></svg
        >
        {recipe.cookTime / 60 / 1000000} minutes
      </div>

      <h2 class="recipe">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="iconify iconify--ph"
          width="32"
          height="32"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 256 256"
          ><path
            fill="currentColor"
            d="M222 128a6 6 0 0 1-6 6h-88a6 6 0 0 1 0-12h88a6 6 0 0 1 6 6Zm-94-58h88a6 6 0 0 0 0-12h-88a6 6 0 0 0 0 12Zm88 116h-88a6 6 0 0 0 0 12h88a6 6 0 0 0 0-12ZM87.9 43.6L57.3 71.8L44.1 59.6a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Z"
          /></svg
        >
        Steps
      </h2>
      <ol id="steps">
        {#each recipe.instructions as step}
          <li class={step.isOptional ? "optional" : ""}>
            {step.text}
          </li>
        {/each}
      </ol>
    </div>
  </div>
{:else if page === "loading"}
  <span class="loader" />
{/if}

<style lang="less">
  @color: #066;
  @text: #333;
  :global(body) {
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
    min-height: 100vh;
  }
  .container {
    display: flex;
    width: 80vw;
    min-height: 80vh;
    margin-top: 3rem;
    margin-bottom: 3rem;
    border-radius: 20px;
    max-width: 700px;
    padding: 2rem;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    .column {
      flex: 3;
    }
    .imageColumn {
      flex: 1;
      margin-right: 1rem;
      img,
      .noImage {
        width: 100%;
        height: 10rem;
        object-fit: cover;
        border-radius: 10px;
      }
      .noImage {
        opacity: 0.5;
        background: #0001;
        border: 2px dashed #0002;
      }
      .ingredientsHeader {
        display: flex;
        align-items: center;
        color: fade(@text, 80%);
        font-weight: 100;
        svg {
          margin-right: 0.2rem;
        }
      }
      #ingredients {
        padding: 0;
      }
      #ingredients li {
        transition: box-shadow 0.3s ease;
        list-style: none;
        padding: 0.4rem;
        border-bottom: 1px solid #0001;
        margin: 0;
        &:hover {
          border-bottom: 1px solid transparent;
          cursor: pointer;
          color: @text;
          transition: box-shadow 0.3s ease;
          box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
            rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
        }
      }
    }
    .recipeColumn {
      padding: 20px;
      h2 {
        margin: 0;
        margin-bottom: 1rem;
        color: @color;
        a {
          .link();
        }
      }
      #details,
      h2 {
        display: flex;
        align-items: center;
      }
      #details {
        color: fade(@text, 70%);
        font-style: italic;
        svg {
          margin: 0 0.4rem;
        }
      }
      .recipe {
        margin-top: 3rem;
        margin-bottom: 0;
        font-weight: 100;
      }
      li {
        color: fade(darken(@color, 10%), 70%);
        margin: 0.2rem auto;
        max-width: 60ch;
        &.optional {
          opacity: 0.8;
        }
      }
      svg {
        display: inline;
        height: 2ch;
        width: 2ch;
        margin-right: 0.2rem;
      }
    }
  }
  .link() {
    text-decoration: none;
    color: fade(@color, 80%);
    border-bottom: 2px dashed fade(@color, 30%);
    margin: 0;
  }

  @media print {
    * {
      box-shadow: none !important;
    }
    #home {
      display: none;
    }
  }
  .loader {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    @lighten: 10%;
    background: linear-gradient(
      0deg,
      lighten(@color, @lighten) 20%,
      spin(lighten(@color, @lighten), 10%) 33%,
      transparent 100%
    );
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
  .loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #fff;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  input {
    padding: 0.5rem 1rem;
    border: 1px solid #0002;
    width: 60vw;
    max-width: 400px;
    &:focus {
      box-shadow: 0 0 0 2px #0001;
    }
    color: #555;
    &::placeholder {
      color: #3335;
    }
  }
  button {
    display: block;
    width: 60vw;
    max-width: 400px;
    cursor: pointer;
    background: #0bb1;
    border: 1px solid #0bb;
    transition: background-color 0.5s ease, transform 0.2s ease;
    color: #066;
    &:hover:not(:disabled),
    &:active:not(:disabled) {
      background: transparent;
    }
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  *:focus {
    outline: none;
  }
  #home {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover {
      background: #0001;
    }
    border-radius: 4px;
    color: #888;
    svg {
      width: 20px;
      height: 20px;
    }
  }
</style>
