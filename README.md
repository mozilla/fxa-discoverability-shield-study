# Firefox Account Browser Discoverability Shield Study

This repo is archived and no longer being developed. From this experiment the FxA toolbar menu was landed
as a native feature in Firefox. [Bugzilla Issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1524665).

## About This Repository

This repository uses the [Shield Study Template](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) to build the Firefox
Account Browser Discoverability Shield Study.

For additional information please review [PHD](https://docs.google.com/document/d/129HzVoufID4S2HRKMivXNW6BvlR6lYMa7Nyg-D-ZenA/edit).

## Running as temporary add-on in Firefox

Please run at your own risk, this is currently still in active development.
If you are building and running this extension locally, please use Firefox Nightly.

1. Goto `about:debugging`
2. Click `Load Temporary Add-on`
3. Select add-on version in `dist` folder

### Documentation

## Seeing the add-on in action

See [TESTPLAN.md](./docs/TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

See [TELEMETRY.md](./docs/TELEMETRY.md) for more details on what pings are sent by this add-on.

## Analyzing data

Telemetry pings are loaded into S3 and re:dash. Sample query:

- [All pings](https://sql.telemetry.mozilla.org/queries/{#your-id}/source#table)

## Improving this add-on

See [DEV.md](./docs/DEV.md) for more details on how to work with this add-on as a developer.
