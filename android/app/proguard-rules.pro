# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line number information for debugging stack traces.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ---- Capacitor / WebView ----
# Keep JavaScript interface classes used by Capacitor WebView bridge
-keepclassmembers class com.getcapacitor.** {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# Keep Capacitor plugin classes
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# ---- Firebase ----
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ---- Facebook SDK (required by @capacitor-firebase/authentication) ----
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**
