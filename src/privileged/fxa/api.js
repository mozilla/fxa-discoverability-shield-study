"use strict";

/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/Console.jsm");
ChromeUtils.import("resource://gre/modules/Services.jsm");
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionUtils.jsm");
ChromeUtils.import("resource://gre/modules/FxAccountsCommon.js");
ChromeUtils.defineModuleGetter(this, "fxAccounts", "resource://gre/modules/FxAccounts.jsm");
ChromeUtils.defineModuleGetter(this, "EnsureFxAccountsWebChannel", "resource://gre/modules/FxAccountsWebChannel.jsm");
ChromeUtils.defineModuleGetter(this, "BrowserWindowTracker", "resource:///modules/BrowserWindowTracker.jsm");
ChromeUtils.defineModuleGetter(this, "Weave", "resource://services-sync/main.js");
const { CustomizableUI } = ChromeUtils.import("resource:///modules/CustomizableUI.jsm", {});

/* eslint-disable no-undef */
const { EventManager } = ExtensionCommon;
const EventEmitter = ExtensionCommon.EventEmitter || ExtensionUtils.EventEmitter;

const FXA_EXTENSION_WIDGET_ID = "fxa-browser-discoverability_mozilla_org-browser-action";
const FXA_ENTRYPOINT = "fxa_discoverability";

async function sanitizeUser(user) {
  if (user) {
    let avatar, email, avatarDefault;
    const { verified } = user;

    if (user.profileCache && user.profileCache.profile) {
      avatar = user.profileCache.profile.avatar;
      email = user.profileCache.profile.email;
      avatarDefault = user.profileCache.profile.avatarDefault;
    }

    const hashedUid = await getHashedUid();

    return {
      avatar,
      avatarDefault,
      email,
      hashedUid,
      verified,
    };
  }

  return undefined;
}

async function getHashedUid() {
  try {
    await Weave.Service.identity._ensureValidToken();
    return Weave.Service.identity.hashedUID();
  } catch (e) {
  }

  return undefined;
}

const fxaEventEmitter = new EventEmitter();

this.fxa = class extends ExtensionAPI {
  /**
   * Extension Shutdown
   * APIs that allocate any resources (e.g., adding elements to the browser’s user interface,
   * setting up internal event listeners, etc.) must free these resources when the extension
   * for which they are allocated is shut down.
   */
  onShutdown(shutdownReason) {
    console.log("onShutdown", shutdownReason);
    // TODO: remove any active ui
  }

  getAPI(context) {
    return {
      fxa: {
        async hideExtension() {
          const widget = await CustomizableUI.getWidget(FXA_EXTENSION_WIDGET_ID);

          if (widget && widget.instances.length > 0) {
            widget.instances.forEach((instance) => {
              const node = instance.node;
              node.setAttribute("hidden", true);
            });
          }
        },

        async getSignedInUser() {
          const user = await fxAccounts.getSignedInUser();
          return sanitizeUser(user);
        },

        async openSyncPreferences() {
          const win = BrowserWindowTracker.getTopWindow();
          win.openPreferences("paneSync", { entryPoint: FXA_ENTRYPOINT });
        },

        emitTelemetryPing(interactionType, elapsedTime) {
          const data = {
            interactionType,
            doorhangerActiveSeconds: `${Math.round(elapsedTime / 1000)}`,
          };
          fxaEventEmitter.emit("onTelemetryPing", data);
        },

        onUpdate: new EventManager(context, "fxa:onUpdate",
          fire => {
            const listener = (name, value, topic) => {
              fire.async(topic);
            };
            fxaEventEmitter.on("onUpdate", listener);
            return () => {
              fxaEventEmitter.off("onUpdate", listener);
            };
          }
        ).api(),

        onTelemetryPing: new EventManager(context, "fxa:onTelemetryPing",
          fire => {
            const listener = (name, value) => {
              fire.async(value);
            };
            fxaEventEmitter.on("onTelemetryPing", listener);
            return () => {
              fxaEventEmitter.off("onTelemetryPing", listener);
            };
          }
        ).api(),

        listen() {
          EnsureFxAccountsWebChannel();

          const broker = {
            observe(subject, topic, data) {
              switch (topic) {
                case ONLOGIN_NOTIFICATION:
                case ONLOGOUT_NOTIFICATION:
                case ON_PROFILE_CHANGE_NOTIFICATION:
                  fxaEventEmitter.emit("onUpdate", data, topic);
              }
            },
          };

          Services.obs.addObserver(broker, ONLOGIN_NOTIFICATION);
          Services.obs.addObserver(broker, ONLOGOUT_NOTIFICATION);
          Services.obs.addObserver(broker, ON_PROFILE_CHANGE_NOTIFICATION);
        },
      },
    };
  }
};
