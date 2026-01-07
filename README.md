# Sinking Islands

TODO list

### Visual

- similar to how it shows staged movement state before submit, it should also
  show that for all the other types of input
- similar to how it shows staged selections on the islands/characters, it should
  also show that for movement and any other input that doesn't really indicate

### Internal

- switch from synchronous while-loop fest to state-based
    - player.ts special handling code for generic thingy... might go away after
      refactor. See TODO in that file

### Functional

- handle page refresh re-connect
- render discard information, deck size information, and opponent's hand size
  information
- there is a bug where characters cannot flee from lava flows

## Reference Material

- [Rules Explanation](https://gamersalliance.com/atlas-zeus/)
- [Board Game Geek photos](https://boardgamegeek.com/image/4472533/atlas-zeus)
