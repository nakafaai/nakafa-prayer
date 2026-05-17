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
        .library(name: "NakafaPrayerCore", targets: ["NakafaPrayerCore"])
    ],
    dependencies: [
        .package(url: "https://github.com/batoulapps/adhan-swift.git", from: "1.4.0")
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
        .executableTarget(
            name: "NakafaPrayer",
            dependencies: ["NakafaPrayerCore"],
            resources: [
                .process("Resources")
            ]
        ),
        .testTarget(
            name: "NakafaPrayerCoreTests",
            dependencies: ["NakafaPrayerCore"]
        )
    ]
)
