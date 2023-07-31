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
    iconstate: "",
    sizes: [
      "70",
      "90",
      "300",
      "512",
      "1024"
    ],
    path: "controller://driver/DRIVER_FILE_NAME/icons/my_icon_%size%.png"
  };

  import { onDestroy, onMount } from "svelte";
  import Tooltip from './Tooltip.svelte';

  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;
  // Allows us to bind to the new input element in the list array and set focus to it once created for better UX
  let newInput;

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
    newInput.focus();
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

	function onKeyUp(e) {
		 switch(e.key) {
			 case "Enter":
        //value.id = "Enter";
        break;
			 case "Tab":
        //value.id = "Tab";
        break;
		 }
	}
</script>

<main>
  <form class="page" on:submit|preventDefault={submit}>
      <div class="icons">
        <label for="id">Icon Name</label>
        <Tooltip title="Enter the file name without the size or extension. File should be a PNG">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
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

    <!-- If the type is a state icon the we need a state id-->
    {#if value.type == "State_Icon"}
      <div class="icons">
        <label for="state">Icon State</label>
        <Tooltip title="Enter the state ID for this icon.">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input autofocus name="iconstate" type="text" bind:value={value.iconstate} />
    {/if}
    <!-- The sizes need to be shown-->
    <div class="icons">
      <label for="sizes">Sizes</label> 
      <Tooltip title="Enter the size of the image. Std: 70, 90, 300, 512, 1024">
        <div class="icon">
          <i class="codicon codicon-info"></i>
        </div>
      </Tooltip>
    </div>
    {#if value.sizes}
      <ul>
        {#each value.sizes as size}
          <li class="list-item">
            <input type="number" group={value.sizes} bind:value={size} />
            <button type="button" on:click|preventDefault={removeItem(size)}>Remove</button>
          </li>
        {/each}
        <li class="list-item">
          <input bind:this={newInput} type="number" group={value.sizes} on:change={addItem} />
        </li>
      </ul>
    {/if}

    <div class="icons">
      <label for="path">Icon Path</label>
      <Tooltip title="Enter the path of file: controller://driver/DRIVER_FILE_NAME/icons/my_icon_%size%.png">
        <div class="icon">
          <i class="codicon codicon-info"></i>
        </div>
      </Tooltip>
    </div>
    <input name="path" type="text" bind:value={value.path} />

    <button on:click|preventDefault={submit}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
    </form>
</main>
<svelte:window on:keyup={onKeyUp}/>