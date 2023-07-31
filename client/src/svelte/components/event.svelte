<script lang="ts">
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  import { onDestroy, onMount } from "svelte";

  const d = {
    id: 1,
    name: "",
    description: "",
  };

  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;

  onMount(async () => {
    console.log("MOUNT");

    let state = vscode.getState();

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
</script>

<main>
  <div class="page">
    <label for="id">ID</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus name="id" type="number" bind:value={value.id} />
    <label for="name">Name</label>
    <input name="name" type="text" bind:value={value.name} />
    <label for="description">Description</label>
    <input name="description" type="text" bind:value={value.description} />

    <button on:click|preventDefault={vscode.postMessage({ type: formType, value: value })}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
  </div>
</main>

<style>
</style>
