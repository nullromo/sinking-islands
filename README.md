# Sinking Islands

TODO list

### Visual

-   characters at the bottom of the circle need to not overlap the action order
    track
-   show players their own cards that they played
-   show the card that is being inputted right now

### Internal

-   switch from synchronous while-loop fest to state-based
    -   player.ts special handling code for generic thingy... might go away
        after refactor. See TODO in that file
-   figure out how to make `tsc --noEmit` actually work

### Functional

-   handle page refresh re-connect
-   player should know how many card are in their opponent's hand and in their
    deck, discard, etc.
-   there is a bug where characters cannot flee from lava flows

## Reference Material

-   [Rules Explanation](https://gamersalliance.com/atlas-zeus/)
-   [Board Game Geek photos](https://boardgamegeek.com/image/4472533/atlas-zeus)
