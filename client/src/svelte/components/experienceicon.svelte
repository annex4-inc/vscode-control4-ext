<script>
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  const experienceicons = [
    { name: "Default Icon", value: "Default_Icon" },
    { name: "State Icon", value: "State_Icon" },
  ];

  const d = {
    id: "",
    type: "Default Icon",
    sizes: [
      "70",
      "90",
      "300",
      "512",
      "1024"
    ],
    template: "controller://driver/DRIVER_FILE_NAME/icons/my_icon_%size%.png"
  };

  import { onDestroy, onMount } from "svelte";

  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;

  //Object.assign(value, d);

  onMount(async () => {
    console.log("MOUNT");

    let state = vscode.getState();

    console.log(state);

    if (state && state.value) {
      value = state.value;
    }

    if (state && state.formType) {
      formType = state.formType;
    }
  });

  onDestroy(() => {
    console.log("Destroy");
  });

  $: {
    vscode.setState({ value, formType });
  }

  window.addEventListener("message", async (event) => {
    console.log("MESSAGE");
    console.log(event);

    const message = event.data;
    switch (message.command) {
      case "update":
        value = message.value;
        formType = "update";

        vscode.setState({ value, formType });

        return;
      case "create":
        // Reset the value to an empty object
        value = {};

        // Assign the default value values
        Object.assign(value, d);

        formType = "create";

        vscode.setState({ value, formType });

        return;
    }
  });

  function addItem(item) {
    if (value.sizes == undefined) {
      value.sizes = [];
    }

    if (item != "" && item != null && item != undefined) {
      value.sizes = [...value.sizes, item.target.value];

      item.target.value = "";
    }
  }

  function removeItem(item) {
    if (value.sizes == undefined) {
      value.sizes = [];
    }

    for (let i = value.sizes.length - 1; i >= 0; i--) {
      if (value.sizes[i] == item) {
        value.sizes = value.sizes.filter((p) => p !== item);
      }
    }
  }

  function submit() {
    let v = {};

    Object.assign(v, value);

    // Clean sizes array if it has no sizes
    if (Array.isArray(v.sizes)) {
      if (v.sizes.length == 0) {
        delete v.sizes;
      }
    }

    switch (v.type) {
      case "Default_Icon":
        break;
      case "State_Icon":
        break;  
    }

    vscode.postMessage({ type: formType, value: v });
  }

  function validate() {
    if (value.sizes == undefined) {
      value.sizes = [];
    }
  }
</script>

<main>
  <form class="page">
    <label for="id">Icon Name</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus name="id" type="text" bind:value={value.id} />

    <!-- Selection for value Type -->
    <label for="type">Type</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select name="type" bind:value={value.type} on:input={validate} on:change="{validate}">
      {#each experienceicons as i}
        <option value={i.value} selected={value.type == i.value}>
          {i.name}
        </option>
      {/each}
    </select>

    <!-- The sizes need to be shown-->
    <label for="sizes">Sizes</label> 
    {#if value.sizes}
      <ul>
        {#each value.sizes as size}
          <li class="list-item">
            <input type="number" group={value.sizes} bind:value={size} />
            <button on:click={removeItem(size)}>Remove</button>
          </li>
        {/each}
        <li class="list-item">
          <input type="number" group={value.sizes} on:change={addItem} />
        </li>
      </ul>
    {/if}

    <label for="template">Link Template</label>
    <input name="template" type="text" bind:value={value.template} />

    <button on:click|preventDefault={submit}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
    </form>
</main>
