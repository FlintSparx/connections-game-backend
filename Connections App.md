# Bare Minimum

* Database  
  * Host game objects  
  * Users  
* Get request  
  * Get game objects from database and return to user  
* Frontend   
  * Display objects in interactable UI  
  * Win and Lose conditions  
    * How many tries? (Probably 4\)  
  * Making and editing game boards  
  * Color coded categories. (difficulty based per category). 

# Nice to Have

* Word filters  
  * ??? [https://www.npmjs.com/package/swearify](https://www.npmjs.com/package/swearify)  
* Category filter  
  * Difficulty filter  
  * Player based   
  * Difficulty rating system (Wins/Plays after 100 plays)  
    * On Loss post to Database  
    * On Win post to Database  
    * 75% success rate \= Easy  
    * 50% success rate \= Medium  
    * 25% success rate \= Hard  
    * \<100 plays, Unrated   
* Tailwindcss [https://www.npmjs.com/package/tailwindcss](https://www.npmjs.com/package/tailwindcss)  
* Give users the option to either reveal the answers or not after a failed attempt to solve a puzzle.




# Stretch goals

* Multiple games  
  * Crosswords, Word-Search, etc.  
* Private puzzle sharing via invite-only link  
* Daily featured puzzle (will we need to create a daily puzzle every day?)  
* add solved puzzles to user accounts with the number of attempts it took to solve each one. 