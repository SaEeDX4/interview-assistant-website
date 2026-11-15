# Official platform and accessibility references

These public references were checked to scope **future experiments**; policy and API support still require re-check before any mobile/macOS implementation or launch.

- Android audio playback capture and MediaProjection: https://developer.android.com/media/platform/av-capture
- Android AudioPlaybackCaptureConfiguration capture policy and USAGE_MEDIA/GAME/UNKNOWN restrictions: https://developer.android.com/reference/android/media/AudioPlaybackCaptureConfiguration
- Android audio usage categorization: https://developer.android.com/reference/android/media/AudioAttributes
- Apple ScreenCaptureKit framework (platform availability must be tested): https://developer.apple.com/documentation/ScreenCaptureKit
- macOS Screen & System Audio Recording privacy permission: https://support.apple.com/guide/mac-help/control-access-to-screen-and-system-audio-recording-mchld6aa7d23/mac
- Apple App Review guidelines, including visible indication and explicit consent for recording (2.5.14): https://developer.apple.com/app-store/review/guidelines/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/

**No claim:** The existence of a capture framework does not imply that meeting-app speech is accessible, that a full live coach meets platform policy, or that store submission would be accepted. All are UNKNOWN pending experiments.
