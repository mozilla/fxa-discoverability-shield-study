/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const ENTRYPOINT_BASE = "fxa_discoverability_v2";
let variation = "control";
const SIGN_IN_LINK = `https://accounts.firefox.com/signin?action=email&service=sync&context=fx_desktop_v3`;
const CONNECT_ANOTHER_DEVICE = `https://accounts.firefox.com/connect_another_device?service=sync&context=fx_desktop_v3`;
const MANAGE_ACCOUNT = `https://accounts.firefox.com/settings?service=sync&context=fx_desktop_v3`;
const CHANGE_AVATAR = `https://accounts.firefox.com/settings/avatar/change?service=sync&context=fx_desktop_v3`;
const DEVICES_AND_APPS = `https://accounts.firefox.com/settings/clients?service=sync&context=fx_desktop_v3`;
const SEND_TAB_INFO = `https://blog.mozilla.org/firefox/send-tabs-a-better-way?utm_source=treatment2`;

function createEntrypointUrl(url) {
  return `${url}&entrypoint=${ENTRYPOINT_BASE}_${variation}`;
}

const CLICK_HANDLERS = new Map([
  [ "sign-in-button", {
    handler: () => createNewTab(createEntrypointUrl(SIGN_IN_LINK)),
    telemetry: "signinClick",
  } ],
  [ "manage-account-button", {
    handler: () => createNewTab(createEntrypointUrl(MANAGE_ACCOUNT)),
    telemetry: "verifiedOpenAccountClick",
  } ],
  [ "sync-preferences-button", {
    handler: () => openSyncPreferences(),
    telemetry: "verifiedOpenSyncClick",
  } ],
  [ "connect-another-device-button", {
    handler: () => createNewTab(createEntrypointUrl(CONNECT_ANOTHER_DEVICE)),
    telemetry: "verifiedOpenCadClick",
  } ],
  [ "avatar", {
    handler: () => createNewTab(createEntrypointUrl(CHANGE_AVATAR)),
    telemetry: "verifiedAvatarClick",
  } ],
  [ "devices-apps-button", {
    handler: () => createNewTab(createEntrypointUrl(DEVICES_AND_APPS)),
    telemetry: "verifiedOpenDevicesClick",
  } ],
  [ "unverified-button", {
    handler: () => openSyncPreferences(),
    telemetry: "unverifiedOpenSyncClick",
  } ],
  [ "send-tab-menu", {
    handler: () => createNewTab(createEntrypointUrl(SEND_TAB_INFO)),
    telemetry: "sendTabDeviceClick",
  } ],
]);

init();

async function init() {
  const startTime = Date.now();
  const user = await browser.fxa.getSignedInUser();

  // Setup the control and treatment menus from fetching the study information
  // from local storage. Unfortunately, we cant use `browser.study.studyInfo`
  // because telemetry complains that the is not setup. There might be a
  // better way to do this...
  const info = await browser.storage.local.get("studyInfo");
  const studyInfo = info.studyInfo;
  variation = studyInfo.variation.name;

  if (user && user.verified) {
    setupAccountMenu(user);
  }

  CLICK_HANDLERS.forEach(({ handler, telemetry }, id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", () => {
        sendTelemetry(telemetry, Date.now() - startTime);
        handler();
      });
    }
  });

  sendTelemetry("toolbarClick", 0);
}

async function setupAccountMenu(user) {
  if (user) {
    const emailElement = document.getElementById("email");
    if (emailElement) {
      emailElement.innerText = user.email;

      if (user.avatarDefault || !user) {
        document.getElementById("avatar").style.backgroundImage = `url("/icons/avatar.svg")`;
      } else {
        document.getElementById("avatar").style.backgroundImage = `url("${user.avatar}")`;
      }

      if (variation !== "treatment2") {
        const sendTabElement = document.getElementById("send-tab-menu");
        sendTabElement.style.display = "none";

        const menuElement = document.getElementById("authenticated");
        menuElement.style.height = "135px";
      }
    }
  }
}

async function createNewTab(url) {

  // On send tab clicks, set a session property that the user clicked the link.
  // When the experiment ends, this value will get appended to the survey.
  if (url.indexOf(SEND_TAB_INFO) > -1) {
    const tab = await browser.storage.local.get("sendTab");
    if (!tab.sendTab) {
      browser.storage.local.set({
        "sendTab": true,
      });
    }
  }

  browser.tabs.create({ url });
  window.close();
}

function openSyncPreferences() {
  browser.fxa.openSyncPreferences();
  window.close();
}

function sendTelemetry(interactionType, elapsedTime) {
  browser.fxa.emitTelemetryPing(interactionType, elapsedTime);
}
