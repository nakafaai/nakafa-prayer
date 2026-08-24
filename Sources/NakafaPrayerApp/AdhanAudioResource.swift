import Foundation

/// Canonical bundled adhan alert resource used by notifications and preview.
enum AdhanAudioResource {
  static let fileName = "adhan-alert.caf"
  static let resourceName = "adhan-alert"
  static let fileExtension = "caf"

  static var url: URL? {
    if let url = Bundle.main.url(forResource: resourceName, withExtension: fileExtension) {
      return url
    }

    if let resourceURL = Bundle.main.resourceURL,
      let bundleURLs = try? FileManager.default.contentsOfDirectory(
        at: resourceURL,
        includingPropertiesForKeys: nil
      )
    {
      for bundleURL in bundleURLs where bundleURL.pathExtension == "bundle" {
        if let bundle = Bundle(url: bundleURL),
          let url = bundle.url(forResource: resourceName, withExtension: fileExtension)
        {
          return url
        }
      }
    }

    guard Bundle.main.bundleURL.pathExtension != "app" else {
      return nil
    }

    return Bundle.module.url(forResource: resourceName, withExtension: fileExtension)
  }

  static var isAvailable: Bool {
    url != nil
  }
}
