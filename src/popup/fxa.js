"use strict";

const ENTRYPOINT = "fxa_discoverability_v2";
const SIGN_IN_LINK = `https://accounts.firefox.com/signin?action=email&service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const CONNECT_ANOTHER_DEVICE = `https://accounts.firefox.com/connect_another_device?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const MANAGE_ACCOUNT = `https://accounts.firefox.com/settings?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const CHANGE_AVATAR = `https://accounts.firefox.com/settings/avatar/change?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const DEVICES_AND_APPS = `https://accounts.firefox.com/settings/clients?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const SEND_TAB_INFO = `https://blog.mozilla.org/firefox/send-tabs-a-better-way?utm_source=${ENTRYPOINT}`;

const CLICK_HANDLERS = new Map([
  [ "sign-in-button", {
    handler: () => createNewTab(SIGN_IN_LINK),
    telemetry: "signinClick",
  } ],
  [ "manage-account-button", {
    handler: () => createNewTab(MANAGE_ACCOUNT),
    telemetry: "verifiedOpenAccountClick",
  } ],
  [ "sync-preferences-button", {
    handler: () => openSyncPreferences(),
    telemetry: "verifiedOpenSyncClick",
  } ],
  [ "connect-another-device-button", {
    handler: () => createNewTab(CONNECT_ANOTHER_DEVICE),
    telemetry: "verifiedOpenCadClick",
  } ],
  [ "avatar", {
    handler: () => createNewTab(CHANGE_AVATAR),
    telemetry: "verifiedAvatarClick",
  } ],
  [ "devices-apps-button", {
    handler: () => createNewTab(DEVICES_AND_APPS),
    telemetry: "verifiedOpenDevicesClick",
  } ],
  [ "unverified-button", {
    handler: () => openSyncPreferences(),
    telemetry: "unverifiedOpenSyncClick",
  } ],
  [ "send-tab-button", {
    handler: () => createNewTab(SEND_TAB_INFO),
    telemetry: "sendTabDeviceClick",
  } ],
]);

init();

async function init() {
  const startTime = Date.now();
  const user = await browser.fxa.getSignedInUser();

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

      // Setup the control and treatment menus from fetching the study information
      // from local storage. Unfortunately, we cant use `browser.study.studyInfo`
      // because telemetry complains that the is not setup. There might be a
      // better way to do this...
      const info = await browser.storage.local.get("studyInfo");
      const studyInfo = info.studyInfo;
      if (studyInfo.variation.name === "control") {
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
  if (url === SEND_TAB_INFO) {
    const tab = await browser.storage.local.get("sendTab");
    if (!!tab.sendTab) {
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
