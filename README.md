# VS Code Control4 Extension
Adds support for Control4 driver development

## Features
* Language Server for the Control4 API
  * Suggestions for Property names and events
  * Auto completion of most Control4 function calls
* WebView components for property, action, command, and event management
* JSON files for individual control over properties, actions, commands, proxies, events, and the UI components
* Sidebar view for a highlevel overview of the different settings in the Control4 driver
* Import .c4z files and have them convert to the new format
* Supports NPM in order to use packages. Will organize Lua packages based on their dependencies and inject them into driver.lua before encryption.

## Requirements

You must install DriverEditor and update the extension settings to point to the path of DriverPackager.exe

## Extension Settings
* Auto Increment Version
* Driver Packager Location
* Export to Driver Location
* Author
* Company

## Roadmap
* Add support for OpenSSL driver encryption instead of using DriverPackager.exe
* Add support for hooks in the language server

## Known Issues
