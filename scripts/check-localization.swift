#!/usr/bin/env swift

import Foundation

struct Catalog: Decodable {
    let strings: [String: Entry]
}

struct Entry: Decodable {
    let localizations: [String: Localization]?
}

struct Localization: Decodable {}

let path = "Sources/NakafaPrayerCore/Resources/Localizable.xcstrings"
let data = try Data(contentsOf: URL(fileURLWithPath: path))
let catalog = try JSONDecoder().decode(Catalog.self, from: data)
let required = ["en", "id"]
var failures: [String] = []

for key in catalog.strings.keys.sorted() {
    let languages = Set(catalog.strings[key]?.localizations?.map(\.key) ?? [])

    for language in required where languages.contains(language) == false {
        failures.append("\(key) missing \(language)")
    }
}

if failures.isEmpty {
    print("Localization OK")
    exit(0)
}

print(failures.joined(separator: "\n"))
exit(1)
