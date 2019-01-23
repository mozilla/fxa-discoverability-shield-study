# Telemetry sent by this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Usual Firefox Telemetry is mostly unaffected](#usual-firefox-telemetry-is-mostly-unaffected)
* [Study-specific endings](#study-specific-endings)
* [`shield-study` pings (common to all shield-studies)](#shield-study-pings-common-to-all-shield-studies)
* [`shield-study-addon` pings, specific to THIS study.](#shield-study-addon-pings-specific-to-this-study)
* [Example sequence for a 'voted => not sure' interaction](#example-sequence-for-a-voted--not-sure-interaction)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usual Firefox Telemetry is mostly unaffected

* No change: `main` and other pings are UNAFFECTED by this add-on, except that [shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils) adds the add-on id as an active experiment in the telemetry environment.
* Respects telemetry preferences. If user has disabled telemetry, no telemetry will be sent.

## Study-specific endings

The STUDY SPECIFIC ENDINGS this study supports are:

There are no study specific endings. The study ends once we manually disable or it expires.


## `shield-study` pings (common to all shield-studies)

[shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils) sends the usual packets.

## `shield-study-addon` pings, specific to THIS study.

Pings should be sent from the addon in the following cases:
* Study enrollment / initialization (`start` pingType)
* Study unenrollment / expiration (`stop` pingType)
* UI interaction with the addon (`engage` pingType)

Type of interaction events we need recorded (`interactionType` in ping schema):

1. `toolbarClick`: user clicked on the study's toolbar icon
2. `signinClick`: user clicked on the sync signin button from the doorhanger (only shown when user is not signed in)
3. `unverifiedOpenSyncClick`: user clicked on the button to open sync preferences (only shown when account is in unverified state)
4. `verifiedOpenAccountClick`: user clicked on the button to open FxA account prefs (only shown when account is in verified state)
5. `verifiedOpenSyncClick`: user clicked on the button to open sync prefs (only shown when account is in verified state)
6. `verifiedAvatarClick`: user clicked on their avatar to change it (only shown when account is in verified state)
7. `signinComplete`: browser received a sign-in message
8. `signoutComplete`: browser received a sign-out message

## Example ping schema could look like this
This is just the schema for the specific things we need in this study (what goes in the payload section of the `shield-study-addon` ping), for an example of the full schema see [this](https://github.com/motin/taar-experiment-v3-shield-study/blob/develop/schemas/full-schema.json).

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "fxadisco",
  "definitions": {
    "attributes": {
      "properties": {
        "pingType": {
          "type": "string" // one of: start, stop, engage
        },
        "addonId": {
          "type": "string" // always fxadisco
        },
        "addonVersion" {
          "type": "string" // should be 1
        },
        "branch" {
          "type": "string" //  enrollment cohort; one of control, treatment1, treatment2
        },
        "startTime": {
          "type": "string" // timestamp of interaction event or enrollment
        },
        "fxaState": {
          "type": "string" // one of: verified, unverified, none
        },
        "interactionType": {
          "type": "string" // see list above for possible values, or `none`
        },
        "doorhangerActiveSeconds": {
          "type": "string" // number of seconds doorhanger was displayed for (0 if none)
        },
        "hasAvatar": {
          "type": "string" // true or false, does the user have their avatar displayed in the toolbar.
        }
      },
      "additionalProperties": false,
      "minProperties": 9
    }
  }
}

```
## Example sequence

Click avatar toolbar icon
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "toolbarClick",
      "doorhangerActiveSeconds": "0",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256460655",
      "fxaState": "none",
      "hasAvatar": "false",
      "uid": "none"
    }
  },
  "testing": true
}
```

Click `Turn on Sync...`
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "signinClick",
      "doorhangerActiveSeconds": "3",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256506208",
      "fxaState": "none",
      "hasAvatar": "false",
      "uid": "none"
    }
  },
  "testing": true
}
```

Click `Open Sync Settings...`
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "unverifiedOpenSyncClick",
      "doorhangerActiveSeconds": "1",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256636747",
      "fxaState": "unverified",
      "hasAvatar": "false",
      "uid": "none"
    }
  },
  "testing": true
}
```

Click avatar icon from pull down menu
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "verifiedAvatarClick",
      "doorhangerActiveSeconds": "1",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256715265",
      "fxaState": "verified",
      "hasAvatar": "false",
      "uid": "f37442ce2a1172a59d0dc77e38c6d3a8"
    }
  },
  "testing": true
}
```

Click `Manage Account...`
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "verifiedOpenAccountClick",
      "doorhangerActiveSeconds": "1",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256767566",
      "fxaState": "verified",
      "hasAvatar": "true",
      "uid": "f37442ce2a1172a59d0dc77e38c6d3a8"
    }
  },
  "testing": true
}
```

Click `Sync Preferences`
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "verifiedOpenSyncClick",
      "doorhangerActiveSeconds": "1",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548256803082",
      "fxaState": "verified",
      "hasAvatar": "true",
      "uid": "f37442ce2a1172a59d0dc77e38c6d3a8"
    }
  },
  "testing": true
}
```

Sign-in event
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "signinComplete",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548280727218",
      "fxaState": "verified",
      "hasAvatar": "false",
      "uid": "f37442ce2a1172a59d9dc77e38c6d3a8"
    }
  },
  "testing": true
}
```

Sign-out event
```json
{
  "version": 3,
  "study_name": "fxa-browser-discoverability@shield.mozilla.org",
  "branch": "treatment",
  "addon_version": "1.0.0",
  "shield_version": "5.0.4",
  "type": "shield-study-addon",
  "data": {
    "attributes": {
      "interactionType": "signoutComplete",
      "addonId": "fxadisco",
      "addonVersion": "1",
      "branch": "treatment",
      "startTime": "1548280727218",
      "fxaState": "none",
      "hasAvatar": "false",
      "uid": "f37442ce2a1172a59d9dc77e38c6d3a8"
    }
  },
  "testing": true
}
```
