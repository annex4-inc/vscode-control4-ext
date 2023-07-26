<script lang="ts">
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  import { onDestroy, onMount } from "svelte";

  const d = {
    name: "",
    command: "",
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

  function submit() {
    vscode.postMessage({ type: formType, value: value });
  }
</script>

<main>
  <form class="page" on:submit|preventDefault={submit}>
    <label for="name">Name</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus name="name" type="text" bind:value={value.name} />
    <label for="command">Command</label>
    <input name="command" type="text" bind:value={value.command} />

    <button on:click|preventDefault={submit}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
  </form>
</main>

<style>
</style>
