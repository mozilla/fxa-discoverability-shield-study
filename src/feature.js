/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(feature)" }]*/

const DEFAULT_AVATAR = 0;
const UNVERIFIED_AVATAR = 1;
const USER_AVATAR = 2;

const STANDARD_AVATARS = {
  [DEFAULT_AVATAR]: "icons/avatar.svg",
  [UNVERIFIED_AVATAR]: "icons/avatar_confirm.svg",
};

const FXA_EVENTS = {
  ["fxaccounts:onlogin"]: "signinComplete",
  ["fxaccounts:onlogout"]: "signoutComplete",
};

const ADDON_ID = "fxadisco";
const ADDON_VERSION = "2";

const ADDON_TITLE = "Firefox Account";
const SIGN_IN_PAGE = "popup/sign_in/sign_in.html";
const UNVERIFIED_PAGE = "popup/unverified/unverified.html";
const MENU_PAGE = "popup/menu/menu.html";

class FxABrowserFeature {
  constructor() {}

  configure(studyInfo) {
    this._variation = studyInfo.variation.name;

    browser.fxa.listen();
    browser.fxa.onUpdate.addListener(this.updateState.bind(this));
    browser.fxa.onTelemetryPing.addListener(this.sendTelemetry.bind(this));

    // For control, the add-on is still installed but removed
    // from the browser toolbar. This will allow us to end the
    // study and have the user fill out survey.
    browser.windows.onCreated.addListener(this.hideExtensionIfControl.bind(this));

    if (studyInfo.isFirstRun) {
      this.sendFirstRunTelemetry();
    }

    // We store study information here so that the menus can determine which
    // buttons to show for treatment and treatment2.
    browser.storage.local.set({
      "studyInfo": studyInfo,
    });

    this.hideExtensionIfControl();
    this.updateState();

    browser.browserAction.setTitle({ title: ADDON_TITLE });
    browser.browserAction.setIcon({ path: STANDARD_AVATARS[DEFAULT_AVATAR] });
  }

  hideExtensionIfControl() {
    if (this._variation === "control") {
      browser.fxa.hideExtension();
    }
  }

  async sendFirstRunTelemetry() {
    // Not ideal to fetch the signed in user twice but figured
    // since this only happens on first run it would be ok.
    const user = await browser.fxa.getSignedInUser();
    let fxaState = "none";
    if (user) {
      if (user.verified) {
        fxaState = "verified";
      } else {
        fxaState = "unverified";
      }
    }

    this.sendTelemetry({
      pingType: "start",
      interactionType: "none",
      fxaState,
      doorhangerActiveSeconds: "0",
    });
  }

  async updateState(value, event) {
    // The stored sessionToken will always be the source of truth when checking
    // account state.
    const user = await browser.fxa.getSignedInUser();

    if (user) {

      this._hashedUid = user.hashedUid;

      if (user.verified) {
        this.verifiedUser(user);
      } else {
        this.unverifiedUser();
      }
    } else {
      this.noUser();
    }

    if (FXA_EVENTS[event]) {
      this.sendTelemetry({
        interactionType: FXA_EVENTS[event],
      });
    }
  }

  noUser() {
    this._state = null;
    this.standardAvatar(DEFAULT_AVATAR);
    browser.browserAction.setPopup({ popup: SIGN_IN_PAGE });
  }

  standardAvatar(id) {
    this._avatarUrl = null;
    if (this._avatar !== id) {
      this._avatar = id;
      browser.browserAction.setIcon({ path: STANDARD_AVATARS[id] });
    }
  }

  unverifiedUser() {
    this._state = "unverified";
    this.standardAvatar(UNVERIFIED_AVATAR);
    browser.browserAction.setPopup({ popup: UNVERIFIED_PAGE });
  }

  verifiedUser(user) {
    this._state = "verified";
    if (user.avatar && !user.avatarDefault) {
      this.userAvatar(user.avatar);
    } else {
      this.standardAvatar(DEFAULT_AVATAR);
    }

    browser.browserAction.setPopup({ popup: MENU_PAGE });
  }

  userAvatar(url) {
    if (this._avatar === USER_AVATAR && this._avatarUrl === url) {
      return;
    }

    this._avatar = USER_AVATAR;
    this._avatarUrl = url;

    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;

      const ctx = canvas.getContext("2d");

      // Create a circular avatar
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, 2 * Math.PI);
      ctx.clip();

      ctx.drawImage(this, 0, 0);

      const imageData = ctx.getImageData(0, 0, 200, 200);

      browser.browserAction.setIcon({ imageData });
    };
    img.src = url;
  }

  sendTelemetry(data) {
    browser.study.sendTelemetry({
      ...data,
      addonId: ADDON_ID,
      addonVersion: ADDON_VERSION,
      branch: this._variation,
      startTime: `${Date.now()}`,
      fxaState: this._state || data.fxaState || "none",
      hasAvatar: `${this._avatar === USER_AVATAR}`,
      uid: this._hashedUid || "none",
    });
  }

  cleanup() {
    this.sendTelemetry({
      pingType: "stop",
      interactionType: "none",
      doorhangerActiveSeconds: "0",
    });
  }
}

window.feature = new FxABrowserFeature();
