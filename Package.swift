// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "nakafa-prayer",
    defaultLocalization: "en",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "NakafaPrayer", targets: ["NakafaPrayer"]),
        .executable(name: "NakafaPrayerAppStore", targets: ["NakafaPrayerAppStore"]),
        .library(name: "NakafaPrayerApp", targets: ["NakafaPrayerApp"]),
        .library(name: "NakafaPrayerCore", targets: ["NakafaPrayerCore"])
    ],
    dependencies: [
        .package(url: "https://github.com/batoulapps/adhan-swift.git", from: "1.5.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle.git", from: "2.9.6")
    ],
    targets: [
        .target(
            name: "NakafaPrayerCore",
            dependencies: [
                .product(name: "Adhan", package: "adhan-swift")
            ],
            resources: [
                .process("Resources")
            ]
        ),
        .target(
            name: "NakafaPrayerApp",
            dependencies: ["NakafaPrayerCore"],
            resources: [
                .process("Resources")
            ]
        ),
        .executableTarget(
            name: "NakafaPrayer",
            dependencies: [
                "NakafaPrayerApp",
                .product(name: "Sparkle", package: "Sparkle")
            ]
        ),
        .executableTarget(
            name: "NakafaPrayerAppStore",
            dependencies: ["NakafaPrayerApp"]
        ),
        .testTarget(
            name: "NakafaPrayerCoreTests",
            dependencies: ["NakafaPrayerCore"]
        ),
        .testTarget(
            name: "NakafaPrayerAppTests",
            dependencies: ["NakafaPrayerApp", "NakafaPrayerCore"]
        )
    ]
)
