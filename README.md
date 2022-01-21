# VS Code Control4 Extension
Adds support for Control4 driver development

![Sidebar](/images/sideview.png)

## Features
* Language Server for the Control4 API
  * Suggestions for property names and events
  * Auto completion of most Control4 function calls (we may have missed a few)
* Webview components for property, action, command, connections and event management
* JSON files for individual control over properties, actions, commands, proxies, connections, events, and UI components
    * These include JSON schemas with details on structure and parameter values.
* Sidebar view for a highlevel overview of the different settings in the Control4 driver
    * Clicking on them will allow you to edit them in a webview
    * You can also hit up or down arrows to quickly switch their position in the listing
* Import .c4z files and have them convert to the new format
* Uses NPM package.json files to define the driver and specify package dependencies
  * Will automatically organize Lua packages based on their dependencies and inject them into driver.lua.
  * If you want to specify your own repository you'll need to modify the .npmrc file

## Requirements

You must install DriverEditor and update the extension settings to point to the path of DriverPackager.exe. See example below.

![Settings](/images/settings.png)

## Commands (Ctrl+Shift+P)
* Rebuild Test Dependencies - Will automatically rebuild a generated.lua file that automatically includes src from node modules.
* Import C4z - Will import a c4z file and create a project from it.
* Create Project - Will create a new project (ignored if package.json is defined)

## Build Tasks (Ctrl+Shift+B)
On initial project creation we create two build tasks for you (tasks.json), one that is for debug mode (unencrypted) and one for release mode (encrypted).

## Extension Settings
* Auto Increment Version: Automatically increment the version number on each build.
* Driver Packager Location: The location of DriverPackager.exe
* Export to Driver Location: Automatically export to the Control4 drivers folder so Composer picks it up
* Author: Will automatically include this in the Author portion of the package.json on project creation
* Company: Will automatically include this in the creator element of the driver.

## Roadmap
* Add support for OpenSSL driver encryption instead of using DriverPackager.exe
* Add support for hooks in the language server

## Known Issues
