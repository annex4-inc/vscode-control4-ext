<script>
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  import { onDestroy, onMount } from "svelte";

  const d = {
    id: 0,
    connectionname: "",
    type: "",
    consumer: false,
    classes: []
  };

  const Facings = [
    {name: 'Front', value: 0 },
    {name: 'Back', value: 1 },
    {name: 'Top', value: 2 },
    {name: 'Bottom', value: 3 },
    {name: 'Left', value: 4 },
    {name: 'Right', value: 5 },
    {name: 'Unknown', value: 6 },
  ]

  const Types = [
    {name: 'Control', value: 1 },
    {name: 'Proxy', value: 2 },
    {name: 'Audio/Video', value: 3 },
    {name: 'Network', value: 4 },
    {name: 'Video', value: 5 },
    {name: 'Audio', value: 6 },
    {name: 'Room', value: 7 },
  ]

  let first;
  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;
  // Allows us to bind to the new input element in the list array and set focus to it once created for better UX
  let newInput;

  onMount(async () => {
    let state = vscode.getState();

    first.focus()

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

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ value, formType });

        return;
      case "create":
        // Reset the value to an empty object
        value = {};

        // Assign the default value values
        Object.assign(value, d);
        
        formType = "create";

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ value, formType });

        return;
    }
  });

  function addItem(item) {
    if (value.classes == undefined) {
      value.classes = [];
    }

    if (item != "" && item != null && item != undefined) {
      value.classes = [...value.classes, {classname: item.target.value}];

      item.target.value = "";
    }
    newInput.focus();
  }

  function removeItem(item) {
    if (value.classes == undefined) {
      value.classes = [];
    }

    for (let i = value.classes.length - 1; i >= 0; i--) {
      if (value.classes[i] == item) {
        value.classes = value.classes.filter((p) => p !== item);
      }
    }
  }

  function submit() {
    vscode.postMessage({ type: formType, value: value })
  }
</script>

<main>
  <form class="page" on:submit|preventDefault={submit}>
  <form class="page" on:submit|preventDefault={submit}>
    <label for="id">ID</label>
    <input bind:this={first} name="id" type="number" bind:value={value.id} />

    <label for="connectionname">Connection Name</label>
    <input name="connectionname" type="text" bind:value={value.connectionname} />

    <!-- Selection for value Type -->
    <label for="type">Type</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select name="type" bind:value={value.type}>
      {#each Types as t}
        <option value={t.value} selected={value.type == t.value}>
          {t.name}
        </option>
      {/each}
    </select>

    <!-- Selection for value Facing -->
    <label for="facing">Facing</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select name="facing" bind:value={value.facing}>
      {#each Facings as f}
        <option value={f.value} selected={value.facing == f.value}>
          {f.name}
        </option>
      {/each}
    </select>

    <label for="classes">Classes</label> 
    <ul>
      {#each value.classes as cls}
        <li class="list-item">
          <input type="text" group={value.classes} bind:value={cls.classname} />
          <button type="button" on:click|preventDefault={(event) => removeItem(cls)}>Remove</button>
        </li>
      {/each}
      <li class="list-item">
        <input bind:this={newInput} type="text" group={value.classes} on:change={addItem} />
      </li>
    </ul>

    <label for="consumer">Consumer</label>
    <input type="checkbox" bind:checked={value.consumer} />

    <button type="submit">
      {formType.charAt(0).toUpperCase() + formType.slice(1)}
    </button>
  </form>
</main>

<style>
</style>
