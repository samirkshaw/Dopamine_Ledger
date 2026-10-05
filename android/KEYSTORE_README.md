# Dopamine Ledger — Android Keystore & Signing Documentation

## Permanent Keystore Details

- **Keystore File**: `android/app/dopamine-ledger.keystore`
- **Keystore Alias**: `dopamine-ledger`
- **Password (Store & Key)**: `dopamine2026`
- **Algorithm**: RSA 2048-bit
- **Validity**: 10,000 days (27+ years)
- **Certificate DN**: `CN=Dopamine Ledger, OU=HQ Dopamine, O=HQ Dopamine, L=Kolkata, ST=WB, C=IN`

## Why This Keystore is Permanent & Critical

> **IMPORTANT**:
> Android uses cryptographic signing to enforce app identity and update security.
> - Once you install the app on an Android device, **all future APK/AAB updates must be signed with this exact keystore file and alias**.
> - If the keystore is lost, deleted, or re-generated, Android will reject any update with a **Signature Mismatch error** (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`), forcing you or any user to completely uninstall the app and lose all locally cached data before installing again.
> - **Back up `dopamine-ledger.keystore` safely**.

## Automated Build Configuration

In `android/app/build.gradle`, both `debug` and `release` build types are configured to sign with this permanent keystore:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file('dopamine-ledger.keystore')
            storePassword 'dopamine2026'
            keyAlias 'dopamine-ledger'
            keyPassword 'dopamine2026'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.release
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

This guarantees that whether you build a debug APK from Android Studio for testing on your phone or a release build later, the signing key remains identical and updates will install seamlessly over existing installations.
