<script>
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  const navdisplayoptions = [
    { name: "Default Icon", value: "DEFAULT_ICON" },
    { name: "State Icon", value: "STATE_ICON" },
    { name: "Proxy Binding Id", value: "PROXY_ID" },
    { name: "Translation URL", value: "TRANSLATIONS_URL" },
  ];

  const d = {
    id: "",
    type: "Default Icon",
    iconstate: "",
    sizes: [
      70,
      90,
      300,
      512,
      1024
    ],
    relpath: "icons/device",
    proxybindingid: 5001,
    translation_url: "translations",
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
      //Have to coerce new size entry to number or it creates a text entry.
      value.sizes = [...value.sizes, Number(item.target.value)];

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

      console.log(v.type);
    switch (v.type) {
      case "DEFAULT_ICON":
        delete v.proxybindingid;
        delete v.translation_url;
        delete v.iconstate;
        break;
      case "STATE_ICON":
        delete v.proxybindingid;
        delete v.translation_url;
        break;
      case "PROXY_ID":
        v.id = "Proxy Id";
        delete v.iconstate;
        delete v.sizes;
        delete v.relpath;
        delete v.translation_url;
        break;
      case "TRANSLATIONS_URL":
        v.id = "Translations URL";
        delete v.iconstate;
        delete v.sizes;
        delete v.relpath;
        delete v.proxybindingid;
        break;
      default:
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
    <!-- If the type is an icon the we need ico fields -->
    {#if value.type == "DEFAULT_ICON" || value.type == "STATE_ICON"}  
      <div class="icons">
        <label for="id">Icon Filename</label>
        <Tooltip title="Enter the file name without the size or extension. File should be a PNG. If there is an '_' between filename and size add it here.">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input autofocus name="id" type="text" bind:value={value.id} />
    {:else if value.type == "PROXY_ID"}
      <div class="icons">
        <label for="proxybindingid">Proxy Id</label>
        <Tooltip title="Enter the Navigator Options Proxy Id. Default: 5001. Only one ID allowed.">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input autofocus name="proxybindingid" type="number" bind:value={value.proxybindingid} />
    {:else if value.type == "TRANSLATIONS_URL"}
      <div class="icons">
        <label for="translation_url">Relative Translation URL Path</label>
        <Tooltip title="Enter the the path to translation url relative to root without leading or trailing /. Default: translations">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input autofocus name="translation_url" type="text" bind:value={value.translation_url} />
    {/if}
    <!-- Selection for value Type -->
    <div class="icons">
      <label for="type">Type</label>
      <Tooltip title="Select Nav Option Type. Should only have one Proxy ID, Translation URL, and Default Icon">
        <div class="icon">
          <i class="codicon codicon-info"></i>
        </div>
      </Tooltip>
    </div>
    <!-- svelte-ignore a11y-no-onchange -->
    <select name="type" bind:value={value.type} on:input={validate} on:change="{validate}">
      {#each navdisplayoptions as i}
        <option value={i.value} selected={value.type == i.value}>
          {i.name}
        </option>
      {/each}
    </select>
    <!-- If the type is a state icon the we need a state id-->
    {#if value.type == "STATE_ICON"}
      <div class="icons">
        <label for="iconstate">Icon State</label>
        <Tooltip title="Enter the state ID for this icon. Cannot have duplicates.">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <!-- svelte-ignore a11y-autofocus -->
      <input name="iconstate" type="text" bind:value={value.iconstate} />
    {/if}
    <!-- If the type is an icon the we need size fields and relative icon path-->
    {#if value.type == "DEFAULT_ICON" || value.type == "STATE_ICON"} 
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
        <label for="relpath">Relative Icon Path</label>
        <Tooltip title="Enter the the path to icons relative to root without leading or trailing /. Default: icons/device">
          <div class="icon">
            <i class="codicon codicon-info"></i>
          </div>
        </Tooltip>
      </div>
      <input name="relpath" type="text" bind:value={value.relpath} />
    {/if}

    <button on:click|preventDefault={submit}
      >{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
    </form>
</main>
<svelte:window on:keyup={onKeyUp}/>