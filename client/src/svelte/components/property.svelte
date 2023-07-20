<script>
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  const properties = [
    { value: "STRING", name: "String" },
    { value: "PASSWORD", name: "Password" },
    { value: "LABEL", name: "Label" },
    { value: "RANGED_INTEGER", name: "Ranged Integer" },
    { value: "RANGED_FLOAT", name: "Ranged Float" },
    { value: "SCROLL", name: "Scroll" },
    { value: "TRACK", name: "Track" },
    { value: "LIST", name: "List" },
    { value: "DYNAMIC_LIST", name: "Dynamic List" },
    { value: "DEVICE_SELECTOR", name: "Device Selector" },
    { value: "COLOR_SELECTOR", name: "Color Selector" },
    { value: "CUSTOM_SELECT", name: "Custom Select" },
    { value: "LINK", name: "Link" },
  ];

  const d = {
    name: "",
    type: "STRING",
    default: "",
    readonly: false,
    multiselect: false,
    items: [],
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

  function addItem(event) {
    if (value.items == undefined) {
      value.items = [];
    }

    if (event != "" && event != null && event != undefined) {
      value.items = [...value.items, event.target.value];

      event.target.value = "";
    }
  }

  function removeItem(item) {
    if (value.items == undefined) {
      value.items = [];
    }

    for (let i = value.items.length - 1; i >= 0; i--) {
      if (value.items[i] == item) {
        value.items = value.items.filter((p) => p !== item);
      }
    }
  }

  function submit() {
    let v = {};

    Object.assign(v, value);

    // Clean items array if it has no items
    if (Array.isArray(v.items)) {
      if (v.items.length == 0) {
        delete v.items;
      }
    }

    switch (v.type) {
      case "STRING":
      case "PASSWORD":
      case "LABEL":
      case "DEVICE_SELECTOR":
      case "DYNAMIC_LIST":
      case "LINK":
        delete v.minimum;
        delete v.maximum;
    }

    vscode.postMessage({ type: formType, value: v });
  }

  function validate() {
    if (value.type == "LIST" || value.type == "DEVICE_SELECTOR") {
      if (value.items == undefined) {
        value.items = [];
      }
    }
  }
</script>

<main>
  <form class="page">
    <label for="name">Name</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus name="name" type="text" bind:value={value.name} />

    <!-- Selection for value Type -->
    <label for="type">Type</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select name="type" bind:value={value.type} on:input={validate} on:change="{validate}">
      {#each properties as p}
        <option value={p.value} selected={value.type == p.value}>
          {p.name}
        </option>
      {/each}
    </select>

    <!-- If the type is a list the default and items need to be shown-->
    {#if (value.type == "LIST" || value.type == "DEVICE_SELECTOR") && value.items}
      <ul>
        {#each value.items as item}
          <li class="list-item">
            <input type="text" group={value.items} bind:value={item} />
            <button on:click={removeItem(item)}>Remove</button>
          </li>
        {/each}
        <li class="list-item">
          <input type="text" group={value.items} on:change={addItem} />
        </li>
      </ul>
      <label for="default">Default</label>
      <select name="type" bind:value={value.default}>
        {#each value.items as p}
          <option value={p} selected={p == value.default}>
            {p}
          </option>
        {/each}
      </select>
    {:else if value.type == "RANGED_INTEGER" || value.type == "RANGED_FLOAT"}
      <div class="range">
        <div>
          <label for="minimum">Minimum</label>
          <input name="minimum" type="number" bind:value={value.minimum} />
        </div>

        <div class="maximum">
          <label for="maximum">Maximum</label>
          <input name="maximum" type="number" bind:value={value.maximum} />
        </div>
      </div>

      <label for="default">Default</label>
      <input
        name="default"
        type="number"
        min={value.minimum}
        max={value.maximum}
        bind:value={value.default}
      />
    {:else}
      <label for="default">Default</label>
      <input name="default" type="text" bind:value={value.default} />
    {/if}

    {#if (value.type == "DEVICE_SELECTOR") }
      <label for="multiselect">Multiselect</label>
      <input type="checkbox" bind:checked={value.multiselect} />
    {:else}
      <label for="readonly">Readonly</label>
      <input type="checkbox" bind:checked={value.readonly} />
    {/if}

    <button on:click|preventDefault={submit}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
    </form>
</main>
