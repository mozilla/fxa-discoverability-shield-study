"use strict";

const ENTRYPOINT = "fxa_discoverability";
const SIGN_IN_LINK = `https://accounts.firefox.com/signin?action=email&service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const CONNECT_ANOTHER_DEVICE = `https://accounts.firefox.com/connect_another_device?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const MANAGE_ACCOUNT = `https://accounts.firefox.com/settings?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const CHANGE_AVATAR = `https://accounts.firefox.com/settings/avatar/change?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const DEVICES_AND_APPS = `https://accounts.firefox.com/settings/clients?service=sync&context=fx_desktop_v3&entrypoint=${ENTRYPOINT}`;
const SEND_TAB_DEVICE = `https://support.mozilla.org/kb/send-tab-firefox-ios-your-computer?utm_source=${ENTRYPOINT}`;

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
        handler();
        sendTelemetry(telemetry, Date.now() - startTime);
      });
    }
  });

  sendTelemetry("toolbarClick", 0);
}

function setupAccountMenu(user) {
  if (user) {
    const emailElement = document.getElementById("email");
    if (emailElement) {
      emailElement.innerText = user.email;

      if (user.avatar) {
        document.getElementById("avatar").style.backgroundImage = `url("${user.avatar}")`;
      } else {
        document.getElementById("avatar").style.backgroundImage = `url("/icons/avatar.svg")`;
      }
    }
  }
}

function createNewTab(url) {
  browser.tabs.create({ url });
  window.close();
}

function openSyncPreferences() {
  browser.fxa.openSyncPreferences();
  window.close();
}

async function sendTelemetry(interactionType, elapsedTime) {
  let fxaState, hasAvatar, uid;
  const user = await browser.fxa.getSignedInUser();
  if (user) {
     fxaState = `${user.verified ? "" : "un"}verified`;
     hasAvatar = `${!!user.avatar}`;
     uid = user.hashedUid;
  }
  console.log(browser.study.getStudyInfo());
  browser.study.sendTelemetry({
    addonId: "fxadisco",
    addonVersion: "1",
    //branch: browser.study.getStudyInfo().variation.name,
    startTime: `${Date.now()}`,
    pingType: "engage",
    fxaState: fxaState || "none",
    hasAvatar: hasAvatar || "none",
    uid: uid || "none",
    interactionType,
    doorhangerActiveSeconds: `${Math.round(elapsedTime / 1000)}`,
  });
}
