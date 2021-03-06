* 0.3.0.dev (30.10.13)
  * -- In Progress

* 0.2.6.dev (02.08.13)
  * Cleaned files
  * Made world beautiful
  * Engine improvements
  * 'smart' ai for mode 1
  * Display improvements for multiple shots

* 0.2.5.dev (0412.12)
  * Added GitHub logo for linking to project repository
  * Added image link to GitHub repository on index and game pages
  * Fixed draggable menu on index for FireFox
  * Fixed draggable menu going off the right side of screen in Chrome
  * Forkme added to the page
  * Integrated forkit.js for interactive forking tag (https://github.com/hakimel/forkit.js)
  * Integrated Showdown (A markdown javascript library) for displaying markdown within our pages. (https://github.com/coreyti/showdown)
  * Added a markdown display of humans.txt when you pull down on the forkit widget
  * Fixed some styling
  * Added white bullet marks to the stylesheet
  * Added code to check if we are in a development version and display relevent development information on the index page
  
* 0.2.4.dev (04.12.12)
  * Added this file and linked it to the version display
  * Made the AI a little smarter in placing its ships
  * Added a script to load the timestamp if available for the development version
  * Tweaked ship placement subroutines
  * Fixed random lockup bug on AI attempting an incorrect placement of a shipgia
  
* 0.2.3.dev (04.12.12)
  * Fix for AI finishing game and the UI taking the player to the AI's player screen
  
* 0.2.2.dev (04.12.12)
  * Changed history to include both players recent history
  * Changed turn counter to act as a round counter instead of incrementing each turn
  * Upgraded the logic behind the Plasma Salvo to automatically choose cells that are known to be hits before firing random shots
  * Added some brains to the lazyAI to present more of a challenge during game play
  
* 0.2.1.dev (04.12.12)
  * Fix for critical error in Chrome where users could not place a ship
  * Optimized ship display code for placement, significantly improving performance
  * Cleaned up randomization code in index.html
  
* 0.2.0.dev (03.12.12)
  * First edition with player ship placement
  * Fixed random crash when Photon Bombing Run was used near the right edge of the board
  
* 0.1d (03.12.12)
  * Added a forfeit button to the game page
  * Started moving ship placement code into the UI and out of game.html
  * Attempted implementation of minimum window size
  * Fixed a spelling issue in the UI
  * Reduced the number of alerts in single player mode
  
* 0.1c (03.12.12)
  * Fixed footer on front page
  * Added version indicator to the upper left corner of game and index
  
* 0.1b (03.12.12)
  * Removed extra files from repository
  
* 0.1a (03.12.12)
  * First official alpha release
  * Ship placement randomized at startup
  * First implementation of lazyAI which was an upgrade from the dumb AI where shots are simply fired at random
  * Single player modes are very buggy
  * Two player for mode 1 exists, two player for mode 2 does not
  * Shot selection is ugly and broken
  * Game will randomly freeze
  
