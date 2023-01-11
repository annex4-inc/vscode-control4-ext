# Change Log
All notable changes to the "control4" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.5] - 2023-01-11
### Added
- Added missing autobind from connections
- Added better support for web_view_url and navigator_display_option capabilities
- Added merge stage to automatically merge lua files on encrypted builds
### Changed
- Changed the way connections are shown in tree view, they now include the class name
- SendToProxy suggestions now include control connections
### Fixed
- Fixed an issue where development dependencies were injected into the build

## [0.0.6] - 2023-01-11
### Added
- Added missing schema property for icons in package.json
### Fixed
- Fixed an issue where icon paths were not being set properly in package.json on import
- Fixed an issue importing 'navigator_display_option' and 'web_view_url' capabilities
- Fixed an issue importing empty values from capabiltiies