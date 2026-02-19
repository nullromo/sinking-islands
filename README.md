# Sinking Islands

## Plan

1. ✅ Create users and store in redis.
1. ✅ User sessions.
1. ✅ Re-structure backend to be state-based. REST API operates on game states
   that are stored in localhost Redis. Backend associates user IDs with players
   A and B. Each request includes
    - User token to validate identity
    - Game ID to select the game to operate on
    - Action (same as current socket event name)
    - Data (same as socket payload)
1. ✅ When a user connects, they still need to get a socket that the server can
   use to update the game state.
1. ✅ Put everything into a docker container and try to run it like that.
1. ✅ Get started with Hetzner with 2 VMs (application and build)
1. ✅ Make a Dokploy instance in Hetzner that will push to the application VM
1. Make a github action that spins up the build server, runs the build, then
   shuts down the build server
    1. AI response:

    ```
    Using the Hetzner Cloud CLI (hcloud) via SSH/Action
    If you have a persistent VM that you want to manually power on and off at specific times, you can use an action that interacts with the Hetzner Cloud API or SSHs into a control machine. The hcloud CLI is the command-line interface for interacting with Hetzner Cloud.
    Prerequisites:
    Hetzner API Token: Create a Read & Write API token in the Hetzner Cloud Console and add it to your GitHub repository secrets (e.g., as HCLOUD_TOKEN).
    Server Name/ID: Know the name or ID of the specific VM you wish to control.
    Workflow Example (using SSH to run the CLI command):
    You can use an action like appleboy/ssh-action to connect to a management server and run the necessary hcloud commands to start or stop a target VM.
    To start a VM: hcloud server poweron [SERVER_NAME_OR_ID]
    To stop a VM: hcloud server poweroff [SERVER_NAME_OR_ID]
    ---
    To use the hcloud CLI in a GitHub Actions workflow, you can use a dedicated GitHub Action to install the CLI and configure it with a Hetzner Cloud API token.
    Prerequisites
    Create an API Token: In the Hetzner Cloud Console, select your project and create a new API token.
    Store as a GitHub Secret: In your GitHub repository, go to Settings -> Secrets -> Actions, and add your API token as a new repository secret (e.g., named HCLOUD_TOKEN).
    Workflow Example
    The following YAML workflow demonstrates how to install the hcloud CLI using the hetznercloud/setup-hcloud action and then run an hcloud command.
    yaml
    name: Manage Hetzner Cloud Resources

    on: [push]

    jobs:
      manage-servers:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Setup hcloud CLI
            uses: hetznercloud/setup-hcloud@v1
            with:
              # Optional: specify a specific version, e.g., 'v1.41.1', or 'latest'
              hcloud-version: latest

          - name: List server types
            run: hcloud server-type list
            env:
              # Use the secret you created in GitHub
              HCLOUD_TOKEN: ${{ secrets.HCLOUD_TOKEN }}
    ```

1. ✅ Get a domain with Namecheap
1. Clean up all the visuals so that it looks nice when you are playing.
   Including not skipping ahead. Animations one at a time.
1. Build a tutorial that explains the game.
1. Do I need to use tailscale for DNS?

## Visual

- similar to how it shows staged movement state before submit, it should also
  show that for all the other types of input
- similar to how it shows staged selections on the islands/characters, it should
  also show that for movement and any other input that doesn't really indicate
- make everything pretty. Get some good AI art going.
- Make curved arrows that point to where things are being targeted. (try
  `M 10 0 S 0 0 -8 6 M 10 0 S 10 -10 0 -10 M 0 -10 S -10 -10 -10 0 M 10 0 S 10 10 0 10 M -10 0 S -10 10 0 10`
  at https://yqnn.github.io/svg-path-editor/ for an example of arrows that can
  cross a circular board properly).
    ```
      <svg x="30" y="30" width="100" height="100"><path d="M 10 0 S 0 0 -8 6 M 10 0 S 10 -10 0 -10 M 0 -10 S -10 -10 -10 0 M 10 0 S 10 10 0 10 M -10 0 S -10 10 0 10" style="fill:none;stroke:red;stroke-width:3" transform="translate(30, 30) scale(3)"></path></svg>
    ```
- Should have hover stuff

## Later Features

- Users want to see their game history. They should be able to have some number
  of active games (5?) and they should see their previous games. Replays would
  be nice. Also win/loss ratio and such. Analytics.
- Host/join public games.
- Run code coverage and tests with CI
- Add code coverage report to README
- Actually use `roundsCompleted`
- Need some way to limit people from creating 1000 accounts or 1000 games

## things to add tests for

- rising waters moves when volcano blows up
- tortoise falls off when character moves
- tortoise card is reclaimed when tortoise dies for any reason
- net card is reclaimed when island sinks or erupts
- pilings card is reclaimed when island sinks or erupts

## Tutorial ideas

- The gods are displeased! This petty human war has gone on far too long, and
  it's time for it to end! In Sinking Islands, battle ensues on an
  ever-shrinking archipelago. The gods have begun to sink the islands one at a
  time, and they won't stop until one army eliminates the other. Fight for
  survival, lest everyone sink into the stormy sea!
