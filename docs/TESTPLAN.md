# Test plan for this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Manual / QA TEST Instructions](#manual--qa-test-instructions)
  * [Preparations](#preparations)
  * [Install the add-on and enroll in the study](#install-the-add-on-and-enroll-in-the-study)
* [Expected User Experience / Functionality](#expected-user-experience--functionality)
  * [Control variation](#control-variation)
    * [Does not display avatar icon](#does-not-display-avatar-icon)
    * [Prompts for shield study experiment survey](#prompts-for-shield-study-experiment-survey)
  * [Treatment variation](#treatment-variation)
    * [With new Firefox Account](#with-new-firefox-account)
    * [With existing Firefox Account](#with-existing-firefox-account)
    * [Menu links work](#menu-links-work)
    * [Disconnect Firefox Account](#disconnect-firefox-account)
    * [Prompts for shield study experiment survey](#prompts-for-shield-study-experiment-survey-1)
  * [Design](#design)
  * [Note: checking "sent Telemetry is correct"](#note-checking-sent-telemetry-is-correct)
* [Debug](#debug)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Manual / QA TEST Instructions

### Testing Platforms and Locales

Currently, testing for this extension should be done at a minimum for these platforms

* Windows 10
* OSX 10.14

In addition, these english locales should also be tested

* en-GB
* en-CA
* en-ZA
* en-US

### Preparations

* Download a Nightly version of Firefox

### Install the add-on and enroll in the study

* (Create profile: <https://developer.mozilla.org/Firefox/Multiple_profiles>, or via some other method)
* Navigate to _about:config_ and set the following preferences. (If a preference does not exist, create it be right-clicking in the white area and selecting New)
  * `extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName`
    * Specify the experiment variation
    * String - values `control`, `treatment`
  * `extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired`
    * Specify if the experiment is expired
    * Boolean - values `true` and `false`
* Set `shieldStudy.logLevel` to `All`. This permits shield-add-on log output in browser console.
* Go to [this study's tracking bug](tbd: replace with your study's launch bug link in bugzilla) and install the latest add-on zip file

## Expected User Experience / Functionality

Users see:

* Users in treatment variation should see an avatar icon to the left of the hamburger menu.
* Users in the control variation should not see the avatar icon.

### Control variation

#### Does not display avatar icon

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=control
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=false
    * Reload the extension from about:debugging

Expected:

1. Avatar icon is not loaded

#### Prompts for shield study experiment survey

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=control
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=true
    * Reload the extension from about:debugging

Expected:

1. New browser tab opened with url
    * https://qsurvey.mozilla.com/s3/Avatar-Experiment?reason=expired
    * There will be extra telemetry parameters appended to link but `syncstate=0&b=control` should specified in url

### Treatment variation

#### With new Firefox Account

Prerequisites:

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=treatment
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=false
    * Reload the extension from about:debugging

Steps:

1. Click avatar icon  
2. Click `Turn on Sync...`
    * New tab is opened for Firefox Account
3. Enter test email, click next
4. Enter valid password, enter age > 21, click next
5. Click `Save selections`
    * Browser page navigates to `Confirm your account`
    * Browser avatar icon changes to avatar with mail (unverified state)
6. Click avatar icon
    * Displays `Check Your Email` and button `Open Sync Preferences`
7. Click `Open Sync Preferences`
    * Browser opens new tab with url `about:preferences#sync`
8. Verify account from email inbox
    * Browser is notified that account is verified and starts to sync
9. Click avatar icon
    * Displays `Syncing to...` with email
    * Displays `Manage Account` and `Sync Preferences`

#### With existing Firefox Account

Prerequisites:

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=treatment
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=false
    * Reload the extension from about:debugging
3. A verified existing Firefox Account

Steps:

1. Click avatar icon  
2. Click `Turn on Sync...`
    * New tab is opened for Firefox Account
3. Enter test email, click next
4. Enter account password, click next
    * Browser is notified of account login and starts to sync
9. Click avatar icon
    * Displays `Syncing to...` with email
    * Displays `Manage Account` and `Sync Preferences`

#### Menu links work

Prerequisites:

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=treatment
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=false
    * Reload the extension from about:debugging
3. A verified Firefox Account.
4. Logged into extension using steps from [here](#with-existing-firefox-account).

Steps:

1. Click avatar icon, click `Manage Account`
    * Browser opens a new tab to `https://accounts.firefox.com/settings?`
2. Close tab
3. Click avatar icon, click `Sync Preferences`
    * Browser opens a new tab to `about:preferences#sync`
4. Close tab
5. Click avatar icon, click avatar image next to `Syncing to...`
    * Browser opens a new tab to `https://accounts.firefox.com/settings/avatar/change?`
6. Select and upload an avatar, click `Done`
    * Avatar icon changes to the uploaded image

#### Disconnect Firefox Account

Prerequisites:

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=treatment
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=false
    * Reload the extension from about:debugging
3. Log into extension using a verified account

Steps:

1. Open link `about:preferences#sync`
2. Click `Disconnect` from sync settings page
3. Click `Just Disconnect`
    * Browser removes Firefox Account
4. Click avatar icon
    * Displays `Turn on Sync...`

#### Prompts for shield study experiment survey

Prerequisites:

1. Load the extension
2. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.variationName=treatment
    * Reload the extension from about:debugging
3. Log into extension using a verified Firefox Account.
4. Set about:config values
    * extensions.fxa-browser-discoverability_shield_mozilla_org.test.expired=true
    * Reload the extension from about:debugging

Steps:

1. New browser tab opened with url
    * https://qsurvey.mozilla.com/s3/Avatar-Experiment?reason=expired
    * There will be extra telemetry parameters appended to link but `syncstate=1&b=treatment` should specified in url

### Design

UX Mockups can be found [here](https://mozilla.invisionapp.com/share/85PSXVZAKGY#/screens/339003076_Artboard).

### Note: checking "sent Telemetry is correct"

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) log output from the add-on.

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Debug

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.
