# Sinking Islands

## Main stuff

1. Clean up top-right corner visual stuff. Icons for card piles. Ability to see
   the cards in the piles as a pop-up with OnScreenCard items and hoverable.
1. Ability to read rules manual any time as a pop-up.
1. Implement game end, cleanup, abandon, etc.
1. Preload images so that it doesn't look bad when loading.
1. Do not skip ahead. Do some kind of animations one at a time of game events.

## Setup stuff

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

1. Do I need to use tailscale for DNS?

## Later Features

- Users want to see their game history. They should be able to have some number
  of active games (5?) and they should see their previous games. Replays would
  be nice. Also win/loss ratio and such. Analytics.
- Spectate games implementation.
- Run code coverage and tests with CI
- Figure out why the deployment crashes
- Control deployment process more strictly once things get up and running for
  real
- Add code coverage report to README
- Actually use `roundsCompleted`
- Need some way to limit people from creating 1000 accounts or 1000 games
- Make some kind of bug reporting form and also a donation link. Provide my
  e-mail address.

## things to add tests for

- rising waters moves when volcano blows up
- tortoise falls off when character moves
- tortoise card is reclaimed when tortoise dies for any reason
- net card is reclaimed when island sinks or erupts
- pilings card is reclaimed when island sinks or erupts
