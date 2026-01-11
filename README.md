# Sinking Islands

## Plan

1. Auth based on users stored in localhost redis. Create account and store in
   encrypted datastore. Login endpoint with tokens.
1. Re-structure backend to be state-based. REST API operates on game states that
   are stored in localhost Redis. Backend associates user IDs with players A and
   B. Each request includes
    - User token to validate identity
    - Game ID to select the game to operate on
    - Action (same as current socket event name)
    - Data (same as socket payload)
1. When a user connects, they still need to get a socket that the server can use
   to update the game state.
1. Put everything into a docker container and try to run it like that.
1. Get started with Hetzner with 2 VMs (application and build)
1. Make a Dokploy instance in Hetzner that will push to the application VM
1. Make a github action that spins up the build server, runs the build, then
   shuts down the build server

## Visual

- similar to how it shows staged movement state before submit, it should also
  show that for all the other types of input
- similar to how it shows staged selections on the islands/characters, it should
  also show that for movement and any other input that doesn't really indicate
- make everything pretty. Get some good AI art going.
