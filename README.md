# Sinking Islands

TODO list:

-   switch from synchronous while-loop fest to state-based
    -   player.ts special handling code for generic thingy... might go away
        after refactor. See TODO in that file
-   handle page refresh re-connect
-   players should know when they are about to play if they are under the
    effects of indescretion
-   player should know how many card are in their opponent's hand and in their
    deck, discard, etc.
-   Figure out how to make `tsc --noEmit` actually work
-   display remaining movement points while choosing normal movement
-   confirm that characters cannot move off of netted islands
-   make sure cursors are correct for islands/characters/cards for all
    situations
-   deal with situation of 2 identical characters on an island when selecting a
    tortoise/harpoon target
-   better feedback for users when they enter an illegal choice
