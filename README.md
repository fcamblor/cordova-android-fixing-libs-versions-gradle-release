plugin add cordova-android-fixing-libs-versions-gradle-release
======================================

This Cordova/Phonegap plugin for Android aligns various versions of the Play Services & Android Support libraries specified by other plugins to a specific version.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Purpose](#purpose)
- [Caveats](#caveats)
- [Installation](#installation)
- [Library versions](#library-versions)
  - [Default version](#default-version)
  - [Other versions](#other-versions)
- [Example](#example)
- [Credits](#credits)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
 
# Purpose

**TL;DR**: To prevent build failures caused by including different versions of the Play Services / Android Support libraries. 

Some Cordova plugins include the [Play Services library](https://developers.google.com/android/guides/overview) and/or 
[Android Support Libraries](https://developer.android.com/topic/libraries/support-library/index.html) to faciliate them.
Most commonly, these are now included into the Cordova project by specifying them as Gradle dependencies 
(see the [Cordova plugin spec documenation](https://cordova.apache.org/docs/en/latest/plugin_ref/spec.html#framework)).

Example plugins:
- [cordova-diagnostic-plugin](https://github.com/dpa99c/cordova-diagnostic-plugin)
- [Telerik ImagePicker plugin](https://github.com/Telerik-Verified-Plugins/ImagePicker)
- [cordova-plugin-local-notifications](https://github.com/katzer/cordova-plugin-local-notifications/)
- [cordova-plugin-facebook4](https://github.com/jeduan/cordova-plugin-facebook4)
- [cordova-plugin-googleplus)](https://github.com/EddyVerbruggen/cordova-plugin-googleplus)
- [phonegap-plugin-push@1](https://github.com/phonegap/phonegap-plugin-push/tree/v1.10.5)
- [google-analytics-plugin](https://github.com/danwilson/google-analytics-plugin)

The problem arises when these plugins specify different versions of the Play Services / Android Support libraries. This 
can cause build failures to occur, which are not easy to resolve without changes by the plugin authors to align the 
specified versions. 

See these issues:

- [phonegap-plugin-barcodescanner#480](https://github.com/phonegap/phonegap-plugin-barcodescanner/issues/480)
- [cordova-plugin-facebook4#507](https://github.com/jeduan/cordova-plugin-facebook4/issues/507)
- [cordova-plugin-local-notifications#1322](https://github.com/katzer/cordova-plugin-local-notifications/issues/1322)
- [cordova-diagnostic-plugin#211](https://github.com/dpa99c/cordova-diagnostic-plugin/issues/211)
- [phonegap-plugin-push#17720](https://github.com/phonegap/phonegap-plugin-push/issues/17720)
- [google-analytics-plugin#427](https://github.com/danwilson/google-analytics-plugin/issues/427)
- [cordova-plugin-googleplus#398](https://github.com/EddyVerbruggen/cordova-plugin-googleplus/issues/398)

To resolve these version collisions, this plugin injects a Gradle configuration file into the native Android platform 
project, which overrides any versions specified by other plugins, and forces them to the version specified in its Gradle file.


# Caveats

There are certain Cordova plugins which, if included into a Cordova project along with this plugin, then this plugin 
is unable to override the library versions they specify.
This is because they use a class to immediately apply their specified Google libraries, instead of just relying on 
the string version to be applied later on by Gradle. 

Two commonly used plugins which do this are:

- [cordova-plugin-fcm](https://github.com/fechanique/cordova-plugin-fcm) in [FCMPlugin.gradle](https://github.com/fechanique/cordova-plugin-fcm/blob/master/src/android/FCMPlugin.gradle#L13)
- [phonegap-plugin-push](https://github.com/phonegap/phonegap-plugin-push) in [push.gradle](https://github.com/phonegap/phonegap-plugin-push/blob/master/push.gradle#L35)

If you include these plugins (or others using the `apply plugin` strategy) in your project, you will likely find that 
this plugin cannot resolve your build issues because it's unable to override the library versions.

[See here](https://github.com/fechanique/cordova-plugin-fcm/issues/350) for some suggestions for resolving these issues 
with `cordova-plugin-fcm`.

# Installation

    $ cordova plugin add cordova-android-fixing-libs-versions-gradle-release
    $ cordova plugin add cordova-android-fixing-libs-versions-gradle-release --variable PLAY_SERVICES_VERSION={required version} --variable ANDROID_SUPPORT_VERSION={required version}
    
The plugin needs to be installed with the [`cordova-fetch`](https://cordova.apache.org/news/2016/05/24/tools-release.html) 
mechanism in order to satisfy its [package dependencies](https://github.com/fcamblor/plugin add cordova-android-fixing-libs-versions-gradle-release/blob/master/package.json#L8) 
by installing it via npm.

Therefore if you're installing with `cordova@6`, you'll need to explicitly specify the `--fetch` option:

    $ cordova plugin add cordova-android-fixing-libs-versions-gradle-release --fetch   
    
# Library versions

## Default version
By default, this plugin will use the major version of the most recent release of the Play Services / Android Support libraries - 
[see here](https://developers.google.com/android/guides/releases) for a list recent versions.
"Most recent release" means the highest major version that will not result in an Alpha or Beta version being included.

    $ cordova plugin add cordova-android-fixing-libs-versions-gradle-release

For example, if the most recent versions are:
- `26.0.0 Beta 2`
- `25.4.0`

Then this plugin will default to `25.+` because `26` is still in Beta.

## Other versions

In some cases, you may want to specify a different version of the Play Services / Android Support libraries.
So this plugin enables you :
- to specify other versions of the Play Services library using the `PLAY_SERVICES_VERSION` plugin variable.
- to specify other versions of the Android Support library using the `ANDROID_SUPPORT_VERSION` plugin variable.
 
For example, if you want to install v10 of the Play Services library, you'd specify the version via the variable:

    cordova plugin add cordova-android-fixing-libs-versions-gradle-release --variable PLAY_SERVICES_VERSION=10.+
    
# Example

Uses v10 of the Play Services library to fix the build issue.

1. `cordova create test1 && cd test1/`
2. `cordova platform add android@latest`
3. `cordova plugin add phonegap-plugin-push@1.10.3`
4. `cordova compile`

Observe the build succeeds and in the console output is `v10.2.6` of Play Services library:

    :prepareComGoogleAndroidGmsPlayServicesBase1026Library

5. `cordova plugin add cordova-plugin-googleplus@5.1.1`
6. `cordova compile`

Observe the build failed and in the console output is higher than `v10.2.6` (e.g `v11`) of Play Services library:

    :prepareComGoogleAndroidGmsPlayServicesBase1100Library

7. `cordova plugin add plugin add cordova-android-fixing-libs-versions-gradle-release --variable PLAY_SERVICES_VERSION=10.+`
8. `cordova prepare && cordova compile`

Observe the build succeeds and in the console output is v10 of Play Services library.

# Credits

Thanks to Dave Alden who is the initiator of both [https://github.com/dpa99c/cordova-android-play-services-gradle-release](cordova-android-play-services-gradle-release)
and [https://github.com/dpa99c/cordova-android-support-gradle-release](cordova-android-support-gradle-release) I decided 
to merge into a single plugin because of [concurrency issue](https://github.com/dpa99c/cordova-android-play-services-gradle-release/issues/8)

Thanks to [**Chris Scott, Transistor Software**](https://github.com/christocracy) for his idea of extending the initial implementation to support dynamic specification of the library version via a plugin variable in [cordova-google-api-version](https://github.com/transistorsoft/cordova-google-api-version)


License
================

The MIT License

Copyright (c) 2018 Frédéric Camblor.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.