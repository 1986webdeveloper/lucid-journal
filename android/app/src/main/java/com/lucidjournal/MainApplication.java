package com.lucidjournal;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnziparchive.RNZipArchivePackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.rnfs.RNFSPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.chirag.RNMail.RNMail;
import com.bugsnag.BugsnagReactNative;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.horcrux.svg.SvgPackage;
import com.zmxv.RNSound.RNSoundPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.FacebookSdk;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {


  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
 


  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNZipArchivePackage(),
            new RNIapPackage(),
            new RNBackgroundFetchPackage(),
            new RNFetchBlobPackage(),
            new RNFSPackage(),
            //new FBSDKPackage(),

            new RNMail(),
            //new FBSDKPackage(),
            new FBSDKPackage(mCallbackManager),
            BugsnagReactNative.getPackage(),
            new ReactNativePushNotificationPackage(),
            new ReactNativeDocumentPicker(),
            new ReactNativeAudioPackage(),
            new SvgPackage(),
            new RNSoundPackage(),
            new SQLitePluginPackage(),
            new VectorIconsPackage(),
            new LinearGradientPackage(),
            new RNGestureHandlerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    FacebookSdk.sdkInitialize(getApplicationContext());
    AppEventsLogger.activateApp(this);
  }
}
