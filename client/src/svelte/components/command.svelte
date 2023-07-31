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
    description: "",
    params: [],
  };

  import { onDestroy, onMount } from "svelte";

  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;

  onMount(async () => {
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

  function addParameter() {
    console.log("ADD PARAMETER");

    if (value.params == undefined) {
      value.params = [
        {
          name: "",
          type: "STRING",
          default: "",
          readonly: false,
          items: [],
        },
      ];
    } else {
      value.params.push({
        name: "",
        type: "STRING",
        default: "",
        readonly: false,
        items: [],
      });
    }

    value.params = value.params;
  }

  function removeParameter(parameter) {
    console.log("REMOVE PARAMETER");

    for (let i = value.params.length - 1; i >= 0; i--) {
      if (value.params[i] == parameter) {
        value.params = value.params.filter((p) => p !== parameter);
      }
    }
  }

  function addItem(param, event) {
    if (param.items == undefined) {
      param.items = [];
    }

    if (event != "" && event != null && event != undefined) {
      param.items = [...param.items, event.target.value];

      event.target.value = "";
    }

    // This will cause a reactive update on the interface.
    value.params = value.params;
  }

  function removeItem(param, item) {
    if (param.items == undefined) {
      param.items = [];
    }

    param.items = param.items.filter((p) => p !== item);

    // This will cause a reactive update on the interface.
    value.params = value.params;
  }

  function validate(param) {
    if (param.type == "LIST") {
      if (param.items == undefined) {
        param.items = [];
      }
    } else {
      delete param.items;
    }
  }
</script>

<main>
  <div class="page-wide">
    <label for="name">Name</label>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus name="name" type="text" bind:value={value.name} />

    <label for="description">Description</label>
    <input name="description" type="text" bind:value={value.description} />

    <div class="toolbar">
      <label for="params">Parameters</label>
      <div class="actions">
        <button class="round-button" on:click={addParameter}>+</button>
      </div>
    </div>

    <table class="full-width">
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Options</th>
        <th>Default</th>
        <th style="width:32px">Actions</th>
      </tr>
      {#each value.params as param}
        <tr>
          <td>
            <input name="name" type="text" bind:value={param.name} />
          </td>

          <td>
            <!-- svelte-ignore a11y-no-onchange -->
            <select
              name="type"
              bind:value={param.type}
              on:input={validate(param)}
              on:change={validate(param)}
            >
              {#each properties as p}
                <option value={p.value} selected={param.type == p.value}>
                  {p.name}
                </option>
              {/each}
            </select>
          </td>

          <td>
            <!-- If the type is a list the default and items need to be shown-->
            {#if param.type == "LIST" && param.items}
              <ul>
                {#each param.items as item}
                  <li class="list-item">
                    <input type="text" group={param.items} bind:value={item} />
                    <button on:click={removeItem(param, item)}>Remove</button>
                  </li>
                {/each}
                <li class="list-item">
                  <input
                    type="text"
                    group={param.items}
                    on:change={(event) => addItem(param, event)}
                  />
                </li>
              </ul>
            {:else if param.type == "RANGED_INTEGER" || param.type == "RANGED_FLOAT"}
              <div class="range">
                <div>
                  <label for="minimum">Minimum</label>
                  <input
                    name="minimum"
                    type="number"
                    bind:value={param.minimum}
                  />
                </div>

                <div class="maximum">
                  <label for="maximum">Maximum</label>
                  <input
                    name="maximum"
                    type="number"
                    bind:value={param.maximum}
                  />
                </div>
              </div>
            {/if}
          </td>
          <td>
            {#if param.type == "LIST" && param.items}
              <select name="type" bind:value={param.default}>
                {#each param.items as p}
                  <option value={p} selected={p == param.default}>
                    {p}
                  </option>
                {/each}
              </select>
            {:else if param.type == "RANGED_INTEGER" || param.type == "RANGED_FLOAT"}
              <input
                name="default"
                type="number"
                min={param.minimum}
                max={param.maximum}
                bind:value={param.default}
              />
            {:else}
              <input name="default" type="text" bind:value={param.default} />
            {/if}
          </td>
          <td class="align-center">
            <button class="round-button" on:click={removeParameter(param)}>-</button>
          </td>
        </tr>
      {/each}
    </table>
    <button
      on:click|preventDefault={vscode.postMessage({
        type: formType,
        value: value,
      })}>{formType.charAt(0).toUpperCase() + formType.slice(1)}</button
    >
  </div>
</main>
